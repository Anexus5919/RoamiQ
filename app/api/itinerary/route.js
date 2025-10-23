// /app/api/itinerary/route.js
import { Ollama } from 'ollama';
import { getJson } from 'serpapi';

// --- Initialize our clients ---
const ollama = new Ollama();
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

// --- Helper: Convert Ollama stream to ReadableStream ---
function ollamaStreamToReadableStream(stream) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.message && chunk.message.content) {
            controller.enqueue(encoder.encode(chunk.message.content));
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });
}

// --- Helper: Format seconds to hours/minutes ---
function formatTravelTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} hours ${minutes} mins`;
}

// --- Helper: Get coordinates from TomTom ---
async function getCoords(location) {
  if (!TOMTOM_API_KEY) throw new Error('TomTom API key is missing');

  const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(location)}.json?key=${TOMTOM_API_KEY}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to geocode location: ${location}`); // Be more specific on error

    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error(`Location not found: ${location}`);

    return data.results[0].position; // Returns { lat, lon }
  } catch (error) {
    console.error('TomTom Geocode Error:', error.message);
    throw error; // Re-throw the error to be caught by the main POST function
  }
}

// --- Helper: Fetch REAL travel data ---
async function getTravelData(from, destination) {
  const options = [];
  let overallDistance = "N/A";

  // 1. Get TomTom route data (Car & Bus)
  try {
    // Note: Coordinates are fetched separately in the main POST function now
    // We assume getCoords has already run successfully if we reach here
    const [fromCoords, destCoords] = await Promise.all([
        getCoords(from),
        getCoords(destination)
    ]); // Re-fetch coords here just for routing, handle potential errors
    const coordsString = `${fromCoords.lat},${fromCoords.lon}:${destCoords.lat},${destCoords.lon}`;

    const carUrl = `https://api.tomtom.com/routing/1/calculateRoute/${coordsString}/json?key=${TOMTOM_API_KEY}&travelMode=car`;
    const busUrl = `https://api.tomtom.com/routing/1/calculateRoute/${coordsString}/json?key=${TOMTOM_API_KEY}&travelMode=bus`;

    const [carResponse, busResponse] = await Promise.allSettled([
      fetch(carUrl),
      fetch(busUrl)
    ]);

    if (carResponse.status === 'fulfilled' && carResponse.value.ok) {
      const data = await carResponse.value.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].summary;
        const distanceKm = `${(route.lengthInMeters / 1000).toFixed(0)} km`;
        options.push({
          mode: 'Car',
          time: formatTravelTime(route.travelTimeInSeconds),
          distance: distanceKm,
        });
        overallDistance = distanceKm;
      }
    }

    if (busResponse.status === 'fulfilled' && busResponse.value.ok) {
      const data = await busResponse.value.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].summary;
        const distanceKm = `${(route.lengthInMeters / 1000).toFixed(0)} km`;
        options.push({
          mode: 'Bus/Train (Public)',
          time: formatTravelTime(route.travelTimeInSeconds),
          distance: distanceKm,
        });
        if (overallDistance === "N/A") overallDistance = distanceKm;
      }
    }

  } catch (error) {
    // Log routing errors but continue
    console.error("TomTom Routing Error within getTravelData:", error.message);
  }

  // 2. Get Flight and Distance (via SerpApi)
  try {
    if (!SERPAPI_API_KEY) throw new Error('SerpApi key is missing');

    const flightQuery = `flight time from ${from} to ${destination}`;
    const distanceQuery = `distance from ${from} to ${destination}`;

    const [flightSearch, distanceSearch] = await Promise.all([
      getJson({ api_key: SERPAPI_API_KEY, q: flightQuery, gl: 'us', hl: 'en' }),
      getJson({ api_key: SERPAPI_API_KEY, q: distanceQuery, gl: 'us', hl: 'en' })
    ]);

    if (flightSearch.answer_box?.duration) {
       options.push({ mode: 'Flight', time: flightSearch.answer_box.duration });
    } else if (flightSearch.answer_box?.snippet) {
       options.push({ mode: 'Flight', time: flightSearch.answer_box.snippet });
    }

    if (overallDistance === "N/A" && distanceSearch.answer_box?.answer) {
      overallDistance = distanceSearch.answer_box.answer;
    }

  } catch (error) {
    console.error("SerpApi Flight/Distance Error:", error.message);
  }

  return { options, distance: overallDistance };
}

// --- Helper: Fetch REAL destination info ---
async function getDestinationInfo(destination, budget) {
  try {
    if (!SERPAPI_API_KEY) throw new Error('SerpApi key is missing');

    let budgetSearchTerm = "";
    if (budget.toLowerCase() === 'luxury') { budgetSearchTerm = "luxury 5 star hotels"; }
    else if (budget.toLowerCase() === 'mid-range') { budgetSearchTerm = "best 3 star and 4 star hotels"; }
    else { budgetSearchTerm = "low cost 3 star hotels"; }

    const attractionsQuery = `top attractions in ${destination}`;
    const hotelsQuery = `${budgetSearchTerm} in ${destination}`;
    const bestTimeQuery = `when is the best time to visit ${destination}`;

    const [attractionsSearch, hotelsSearch, bestTimeSearch] = await Promise.all([
      getJson({ api_key: SERPAPI_API_KEY, q: attractionsQuery, gl: 'us', hl: 'en' }),
      getJson({ api_key: SERPAPI_API_KEY, q: hotelsQuery, gl: 'us', hl: 'en', num: 6, tbm: 'lcl' }),
      getJson({ api_key: SERPAPI_API_KEY, q: bestTimeQuery, gl: 'us', hl: 'en' }),
    ]);

    const highlights = attractionsSearch.knowledge_graph?.tourist_attractions?.map(a => a.name)
      || attractionsSearch.top_sights?.sights?.map(s => s.title)
      || [];

    let hotels = [];
    if (hotelsSearch.local_results) {
       hotels = hotelsSearch.local_results.slice(0, 6).map(h => ({
        name: h.title,
        address: h.address,
        photo: h.thumbnail,
        rating: h.rating,
        link: h.website || h.link,
      }));
    }

    const bestTime = bestTimeSearch.answer_box?.snippet
      || bestTimeSearch.answer_box?.answer
      || (bestTimeSearch.organic_results && bestTimeSearch.organic_results[0].snippet)
      || "Varies by season.";

    return { highlights, hotels, bestTime };
  } catch (error) {
    console.error('SerpApi Error:', error);
    // Return default values but maybe log the error was specifically here
    return { highlights: [], hotels: [], bestTime: "N/A (Error fetching details)" };
  }
}


// --- THE MAIN API ROUTE ---
export async function POST(request) {
  const {
    from,
    destination,
    startDate,
    endDate,
    budget,
    transportMode,
    interests
  } = await request.json();

  // --- Antarctica Guard Rail ---
  if (destination.toLowerCase().includes('antarctica')) {
    return new Response( /* ... Antarctica error JSON ... */ );
  }

  // --- Fetch Data in Parallel ---
  let travelData, destinationInfo, fromCoords, destCoords; // <-- Define coord vars
  try {
    // --- ADDED COORDINATE FETCHING ---
    [travelData, destinationInfo, fromCoords, destCoords] = await Promise.all([
      getTravelData(from, destination),
      getDestinationInfo(destination, budget),
      getCoords(from),       // <-- Fetch origin coordinates
      getCoords(destination) // <-- Fetch destination coordinates
    ]);
    // -----------------------------
  } catch (error) {
    // --- Improved Error Handling ---
    console.error("API Data Fetching Error in POST:", error);
    const errorMessage = error.message.includes("Location not found")
        ? `Could not find location: ${error.message.split(': ')[1]}`
        : `Failed to fetch required API data: ${error.message}`;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    // -----------------------------
  }

  // --- Build the Prompt for the AI ---
  const prompt = `
    You are an expert travel planner. Use the provided REAL-WORLD DATA. Do not invent info.

    --- USER PREFERENCES ---
    - From: ${from}
    - Destination: ${destination}
    - Dates: ${startDate} to ${endDate}
    - Budget: ${budget}
    - Preferred Transport: ${transportMode}
    - Interests: ${interests.join(', ')}

    --- REAL-WORLD DATA ---
    1. Travel Options:
       - Distance: ${travelData.distance}
       - Options: ${JSON.stringify(travelData.options)}
    2. Destination Info:
       - Top Highlights: ${destinationInfo.highlights.join(', ') || 'N/A'}
       - Best Time to Visit: ${destinationInfo.bestTime}
       - Suggested ${budget} Hotels: ${JSON.stringify(destinationInfo.hotels)}
    3. Coordinates:
       - Origin (${from}): ${JSON.stringify(fromCoords)}
       - Destination (${destination}): ${JSON.stringify(destCoords)}

    --- YOUR TASK ---
    1. Create "travelAnalysis". Use "Travel Options" data.
    2. Create "destinationSummary". Pass "bestTimeToVisit" and "hotelSuggestions" data.
    3. Create "thoughtProcess".
    4. Create complete "days" array for ${startDate} to ${endDate}. Include Morning, Afternoon, Evening.
    5. Add 1-2 sentence "description" for each activity explaining relevance.
    6. Weave in "Top Highlights".

    --- JSON-ONLY RESPONSE ---
    Respond ONLY with a valid JSON object. No text before or after.
    {
      "destinationName": "${destination}",
      "fromName": "${from}", // <-- Added for clarity on globe
      "fromCoords": ${JSON.stringify(fromCoords)}, // <-- Added coords
      "destinationCoords": ${JSON.stringify(destCoords)}, // <-- Added coords
      "travelAnalysis": {
        "summary": "Based on real data, here are the travel options...",
        "distance": "${travelData.distance}",
        "options": ${JSON.stringify(travelData.options)}
      },
      "destinationSummary": {
        "bestTimeToVisit": "${destinationInfo.bestTime}",
        "hotelSuggestions": ${JSON.stringify(destinationInfo.hotels)}
      },
      "thoughtProcess": "I used real travel times and sights...",
      "days": [
        {
          "day": 1, "date": "${startDate}", "title": "Travel and Arrival",
          "activities": [
            { "time": "Morning/Afternoon", "description": "Travel from ${from} to ${destination} via [Logical Mode from data]. Estimated time: [Time from data]." },
            { "time": "Evening", "description": "Arrive in ${destination}, check into hotel (Suggestion: ${destinationInfo.hotels.length > 0 ? destinationInfo.hotels[0].name : `a ${budget} hotel`}) and have dinner." }
          ]
        },
        // ... (etc. for all days)
        {
          "day": 2, "date": "[Date Day 2]", "title": "[Title Day 2]",
          "activities": [ { "time": "Morning", "description":"..." }, { "time": "Afternoon", "description":"..." }, {"time": "Evening", "description":"..."} ]
        }
      ]
    }
  `;

  // --- Call AI and Stream ---
  try {
    const responseStream = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    const readableStream = ollamaStreamToReadableStream(responseStream);

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Itinerary streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate itinerary stream. Is Ollama running?' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}