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
    if (!response.ok) throw new Error('Failed to geocode location');
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error(`Location not found: ${location}`);
    
    return data.results[0].position; // Returns { lat, lon }
  } catch (error) {
    console.error('TomTom Geocode Error:', error.message);
    throw error;
  }
}

// /app/api/itinerary/route.js
// ... (keep all other helper functions and imports) ...

// --- REWRITTEN Helper: Fetch REAL travel data ---
async function getTravelData(from, destination) {
  const options = [];
  let overallDistance = "N/A";

  // 1. Get TomTom route data (Car & Bus)
  try {
    const [fromCoords, destCoords] = await Promise.all([
      getCoords(from),
      getCoords(destination)
    ]);

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
    console.error("TomTom Routing Error:", error.message);
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
    
    // Add flight info
    if (flightSearch.answer_box && flightSearch.answer_box.duration) {
       options.push({ mode: 'Flight', time: flightSearch.answer_box.duration });
    } else if (flightSearch.answer_box && flightSearch.answer_box.snippet) {
       options.push({ mode: 'Flight', time: flightSearch.answer_box.snippet });
    }

    // --- THIS IS THE FIX ---
    // If we still don't have a distance (from car/bus), get it from the distance search
    if (overallDistance === "N/A" && distanceSearch.answer_box && distanceSearch.answer_box.answer) {
      overallDistance = distanceSearch.answer_box.answer;
    }
    // -----------------------

  } catch (error) {
    console.error("SerpApi Flight/Distance Error:", error.message);
  }

  return { options, distance: overallDistance };
}

// /app/api/itinerary/route.js
// ... (keep all your other functions: ollamaStreamToReadableStream, getTravelData, etc.) ...

// --- REWRITTEN Helper: Fetch REAL destination info ---
async function getDestinationInfo(destination, budget) {
  try {
    if (!SERPAPI_API_KEY) throw new Error('SerpApi key is missing');

    // --- THIS IS THE FIX ---
    // We create a specific search term based on the user's budget.
    let budgetSearchTerm = "";
    if (budget.toLowerCase() === 'luxury') {
      budgetSearchTerm = "luxury 5 star hotels";
    } else if (budget.toLowerCase() === 'mid-range') {
      budgetSearchTerm = "best 3 star and 4 star hotels"; // Exactly what you asked for
    } else { // Default to 'Budget'
      budgetSearchTerm = "low cost 3 star hotels"; // Exactly what you asked for
    }
    
    const attractionsQuery = `top attractions in ${destination}`;
    const hotelsQuery = `${budgetSearchTerm} in ${destination}`; // Use the new, smarter query
    const bestTimeQuery = `when is the best time to visit ${destination}`;

    const [attractionsSearch, hotelsSearch, bestTimeSearch] = await Promise.all([
      getJson({ api_key: SERPAPI_API_KEY, q: attractionsQuery, gl: 'us', hl: 'en' }),
      
      getJson({ 
        api_key: SERPAPI_API_KEY, 
        q: hotelsQuery, 
        gl: 'us', 
        hl: 'en', 
        num: 6, 
        tbm: 'lcl' // 'tbm=lcl' is for "Local" results
      }),
      
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
        link: h.website || h.link, // Prioritize website link
      }));
    }
    
    const bestTime = bestTimeSearch.answer_box?.snippet 
      || bestTimeSearch.answer_box?.answer
      || (bestTimeSearch.organic_results && bestTimeSearch.organic_results[0].snippet) 
      || "Varies by season.";

    return { highlights, hotels, bestTime };
  } catch (error) {
    console.error('SerpApi Error:', error);
    return { highlights: [], hotels: [], bestTime: "N/A" };
  }
}

// ... (keep your main POST function and the AI prompt exactly as they are) ...


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

  if (destination.toLowerCase().includes('antarctica')) {
    return new Response(
      JSON.stringify({ error: 'Travel to Antarctica requires a specialized expedition and cannot be planned this way.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let travelData, destinationInfo;
  try {
    [travelData, destinationInfo] = await Promise.all([
      getTravelData(from, destination),
      getDestinationInfo(destination, budget)
    ]);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to fetch API data: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- UPDATED PROMPT (Passing new data structures) ---
  const prompt = `
    You are an expert travel planner. You MUST use the provided REAL-WORLD DATA to create a 
    detailed, practical, and inspiring itinerary. Do not invent information.

    ---
    USER PREFERENCES:
    - From: ${from}
    - Destination: ${destination}
    - Dates: ${startDate} to ${endDate}
    - Budget: ${budget}
    - Preferred Transport: ${transportMode}
    - Interests: ${interests.join(', ')}

    ---
    REAL-WORLD DATA:
    1.  Travel Options (from TomTom & Search):
        - Distance: ${travelData.distance}
        - Options: ${JSON.stringify(travelData.options)}
    2.  Destination Info (from Google Search):
        - Top Highlights: ${destinationInfo.highlights.join(', ') || 'N/A'}
        - Best Time to Visit: ${destinationInfo.bestTime}
        - Suggested ${budget} Hotels: ${JSON.stringify(destinationInfo.hotels)}

    ---
    YOUR TASK:
    1.  Create a "travelAnalysis" block. Use the "Travel Options" data directly.
    2.  Create a "destinationSummary" block. Pass the "bestTimeToVisit" and "hotelSuggestions" data through directly.
    3.  Create a "thoughtProcess" block.
    4.  Create a complete day-by-day "days" array, from ${startDate} to ${endDate}.
    5.  For each day, include all 3 parts: "Morning", "Afternoon", and "Evening".
    6.  For each activity, add a 1-2 sentence "description" explaining what it is or 
        why it fits the user's interests.
    7.  Weave the "Top Highlights" into your plan.

    ---
    JSON-ONLY RESPONSE:
    Respond ONLY with a valid JSON object. Do not include any text before or after it.
    {
      "destinationName": "${destination}",
      "travelAnalysis": {
        "summary": "Based on real data, here are the travel options from ${from} to ${destination}:",
        "distance": "${travelData.distance}",
        "options": ${JSON.stringify(travelData.options)}
      },
      "destinationSummary": {
        "bestTimeToVisit": "${destinationInfo.bestTime}",
        "hotelSuggestions": ${JSON.stringify(destinationInfo.hotels)}
      },
      "thoughtProcess": "I've used the real travel times and top sights to build a logical plan...",
      "days": [
        {
          "day": 1,
          "date": "${startDate}",
          "title": "Travel and Arrival",
          "activities": [
            { "time": "Morning", "description": "Travel from ${from} to ${destination} via [Logical Mode from data]." },
            { "time": "Afternoon", "description": "Arrive and transfer to your hotel. We suggest checking into ${destinationInfo.hotels.length > 0 ? destinationInfo.hotels[0].name : `a ${budget} hotel`}." },
            { "time": "Evening", "description": "Settle in and have a relaxing ${budget} dinner at a nearby restaurant." }
          ]
        },
        {
          "day": 2,
          "date": "[Date for Day 2]",
          "title": "[Title based on interests, e.g., 'Historical Exploration']",
          "activities": [
            { "time": "Morning", "description": "Visit [Top Highlight 1]. This is famous for..." },
            { "time": "Afternoon", "description": "Explore [Top Highlight 2]. This fits your interest in [Interest]." },
            { "time": "Evening", "description": "Experience [Local activity, e.g., a local market]." }
          ]
        }
        // ... (etc. for all days)
      ]
    }
  `;

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