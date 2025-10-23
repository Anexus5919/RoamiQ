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
    if (!response.ok) throw new Error(`Failed to geocode location: ${location}`);
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error(`Location not found: ${location}`);
    return data.results[0].position; // { lat, lon }
  } catch (error) {
    console.error('TomTom Geocode Error:', error.message);
    throw error;
  }
}

// --- Helper: Calculate Haversine distance ---
function calculateHaversineDistance(coords1, coords2) {
  if (!coords1 || !coords2 || coords1.lat === undefined || coords2.lat === undefined) return null;
  const R = 6371; // km
  const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
  const lat1 = coords1.lat * Math.PI / 180;
  const lat2 = coords2.lat * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return `${distance.toFixed(0)} km`;
}

// --- Helper: Fetch REAL travel data ---
async function getTravelData(from, destination, preFetchedFromCoords, preFetchedDestCoords) {
  const options = [];
  let overallDistance = "N/A";
  let fromCoords = preFetchedFromCoords;
  let destCoords = preFetchedDestCoords;

  // 1. Ensure Coords (fetch if needed)
  try {
      if (!fromCoords || !destCoords) {
          console.warn("Coordinates not pre-fetched for getTravelData, fetching now...");
          [fromCoords, destCoords] = await Promise.all([ getCoords(from), getCoords(destination) ]);
      }
  } catch (error) {
      console.error("Coordinate Fetching Error within getTravelData:", error.message);
      // Try SerpApi distance as only resort if coords fail here
      try {
          if (SERPAPI_API_KEY) {
              const distanceSearch = await getJson({ api_key: SERPAPI_API_KEY, q: `distance from ${from} to ${destination}`, gl: 'us', hl: 'en' });
              if (distanceSearch.answer_box?.answer) {
                   overallDistance = distanceSearch.answer_box.answer;
              }
          }
      } catch (searchError) {
          console.error("SerpApi distance fallback failed:", searchError.message);
      }
      // Flight info might still work
      try {
         if (SERPAPI_API_KEY) {
           const flightSearch = await getJson({ api_key: SERPAPI_API_KEY, q: `flight time from ${from} to ${destination}`, gl: 'us', hl: 'en' });
           if (flightSearch.answer_box?.duration) options.push({ mode: 'Flight', time: flightSearch.answer_box.duration });
           else if (flightSearch.answer_box?.snippet) options.push({ mode: 'Flight', time: flightSearch.answer_box.snippet });
         }
      } catch (flightError) { console.error("SerpApi flight fallback failed:", flightError.message); }
      return { options, distance: overallDistance }; // Return early
  }

  // 2. TomTom routing
  try {
    if (fromCoords && destCoords) {
        const coordsString = `${fromCoords.lat},${fromCoords.lon}:${destCoords.lat},${destCoords.lon}`;
        const carUrl = `https://api.tomtom.com/routing/1/calculateRoute/${coordsString}/json?key=${TOMTOM_API_KEY}&travelMode=car`;
        const busUrl = `https://api.tomtom.com/routing/1/calculateRoute/${coordsString}/json?key=${TOMTOM_API_KEY}&travelMode=bus`;

        const [carResponse, busResponse] = await Promise.allSettled([ fetch(carUrl), fetch(busUrl) ]);

        if (carResponse.status === 'fulfilled' && carResponse.value.ok) {
          const data = await carResponse.value.json();
          if (data.routes?.length > 0) {
            const route = data.routes[0].summary;
            const distanceKm = `${(route.lengthInMeters / 1000).toFixed(0)} km`;
            options.push({ mode: 'Car', time: formatTravelTime(route.travelTimeInSeconds), distance: distanceKm });
            overallDistance = distanceKm;
          }
        }

        if (busResponse.status === 'fulfilled' && busResponse.value.ok) {
          const data = await busResponse.value.json();
          if (data.routes?.length > 0) {
            const route = data.routes[0].summary;
            const distanceKm = `${(route.lengthInMeters / 1000).toFixed(0)} km`;
            options.push({ mode: 'Bus/Train (Public)', time: formatTravelTime(route.travelTimeInSeconds), distance: distanceKm });
            if (overallDistance === "N/A") overallDistance = distanceKm;
          }
        }
    }
  } catch (error) { console.error("TomTom Routing Error:", error.message); }

  // 3. SerpApi Flight Info
  try {
    if (!SERPAPI_API_KEY) throw new Error('SerpApi key is missing');
    const flightQuery = `flight time from ${from} to ${destination}`;
    const flightSearch = await getJson({ api_key: SERPAPI_API_KEY, q: flightQuery, gl: 'us', hl: 'en' });

    if (flightSearch.answer_box?.duration) options.push({ mode: 'Flight', time: flightSearch.answer_box.duration });
    else if (flightSearch.answer_box?.snippet) options.push({ mode: 'Flight', time: flightSearch.answer_box.snippet });
    else if (options.length === 0 && fromCoords && destCoords) { // Guess flight needed
         const distKmStr = calculateHaversineDistance(fromCoords, destCoords);
         if (distKmStr && parseInt(distKmStr.split(' ')[0], 10) > 1000) {
            options.push({ mode: 'Flight', time: "Varies (check airlines)" });
         }
    }
  } catch (error) { console.error("SerpApi Flight Error:", error.message); }

  // 4. Fallback Distance Calculation
  if (overallDistance === "N/A") {
    try {
      if (!SERPAPI_API_KEY) throw new Error('SerpApi key is missing');
      const distanceQuery = `distance between ${from} and ${destination}`;
      const distanceSearch = await getJson({ api_key: SERPAPI_API_KEY, q: distanceQuery, gl: 'us', hl: 'en' });
      if (distanceSearch.answer_box?.answer) {
        overallDistance = distanceSearch.answer_box.answer;
      } else { // Haversine if SerpApi fails
        const haversineDist = calculateHaversineDistance(fromCoords, destCoords);
        if (haversineDist) overallDistance = haversineDist + " (direct)";
      }
    } catch (error) { // Final Haversine fallback
      console.error("Distance Fallback Error:", error.message);
       const haversineDist = calculateHaversineDistance(fromCoords, destCoords);
       if (haversineDist) { overallDistance = haversineDist + " (direct)"; }
    }
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
      const highlights = attractionsSearch.knowledge_graph?.tourist_attractions?.map(a => a.name) || attractionsSearch.top_sights?.sights?.map(s => s.title) || [];
      let hotels = [];
      if (hotelsSearch.local_results) {
         hotels = hotelsSearch.local_results.slice(0, 6).map(h => ({ name: h.title, address: h.address, photo: h.thumbnail, rating: h.rating, link: h.website || h.link, }));
      }
      const bestTime = bestTimeSearch.answer_box?.snippet || bestTimeSearch.answer_box?.answer || (bestTimeSearch.organic_results && bestTimeSearch.organic_results[0].snippet) || "Varies by season.";
      return { highlights, hotels, bestTime };
    } catch (error) {
      console.error('SerpApi Error:', error);
      return { highlights: [], hotels: [], bestTime: "N/A (Error fetching details)" };
    }
}


// --- THE MAIN API ROUTE ---
export async function POST(request) {
    const { from, destination, startDate, endDate, budget, transportMode, interests } = await request.json();

    // --- Antarctica Guard Rail ---
    if (destination.toLowerCase().includes('antarctica')) {
      return new Response( JSON.stringify({ error: 'Travel to Antarctica requires a specialized expedition and cannot be planned this way.' }), { status: 400, headers: { 'Content-Type': 'application/json' } } );
    }

    // --- Fetch Data in Parallel ---
    let travelData, destinationInfo, fromCoords, destCoords;
    try {
      [fromCoords, destCoords] = await Promise.all([ getCoords(from), getCoords(destination) ]);
      [travelData, destinationInfo] = await Promise.all([ getTravelData(from, destination, fromCoords, destCoords), getDestinationInfo(destination, budget) ]);
    } catch (error) {
      console.error("API Data Fetching Error in POST:", error);
      const errorMessage = error.message.includes("Location not found") ? `Could not find location: ${error.message.split(': ')[1]}` : `Failed to fetch required API data: ${error.message}`;
      return new Response( JSON.stringify({ error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // --- Calculate number of days and generate date strings ---
    let numberOfDays = 'the specified date range';
    let calculatedDays = 0;
    const allDates = []; // Array to hold YYYY-MM-DD date strings
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new Error("Invalid start or end date format"); }
        if (start > end) { throw new Error("Start date must be before end date"); }

        const oneDay = 1000 * 60 * 60 * 24;
        calculatedDays = Math.round(Math.abs((end - start) / oneDay)) + 1;
        numberOfDays = `${calculatedDays} days`;

        let currentDate = new Date(start);
        for (let i = 0; i < calculatedDays; i++) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            allDates.push(`${year}-${month}-${day}`);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } catch (e) {
        console.error("Error calculating date difference or generating dates:", e);
        calculatedDays = 0; // Indicate failure
    }

    // --- Build the Prompt for the AI ---
    const prompt = `
      You are an expert travel planner. You MUST use the provided REAL-WORLD DATA to create a detailed, practical, and inspiring itinerary. Do not invent information.

      --- USER PREFERENCES ---
      - From: ${from}
      - Destination: ${destination}
      - Dates: ${startDate} to ${endDate} (Total: ${numberOfDays})
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
      ${calculatedDays > 0 ? `4. Specific Dates To Plan For: ${JSON.stringify(allDates)}` : ''}

      --- YOUR TASK ---
      1. Create "travelAnalysis". Use "Travel Options" data.
      2. Create "destinationSummary". Pass "bestTimeToVisit" and "hotelSuggestions" data.
      3. Create "thoughtProcess".
      4. **MANDATORY REQUIREMENT: Create a complete day-by-day "days" array covering THE ENTIRE DURATION from ${startDate} to ${endDate}. This means you MUST generate exactly ${numberOfDays} objects in the "days" array, one for each date provided in the 'Specific Dates To Plan For' data. Do not stop early. Use the provided dates.**
      5. For each day object, include a unique 'day' number (1, 2, 3,... up to ${calculatedDays > 0 ? calculatedDays : 'the end date'}), the corresponding 'date' string from the 'Specific Dates To Plan For' data (if available, otherwise calculate it), a 'title', and an 'activities' array.
      6. Each 'activities' array MUST include detailed entries for "Morning", "Afternoon", and "Evening".
      7. Add 1-2 sentence "description" for each activity explaining relevance to interests: ${interests.join(', ')}.
      8. Weave in "Top Highlights" naturally.

      --- JSON-ONLY RESPONSE ---
      Respond ONLY with a valid JSON object. No text before or after. Ensure ALL string values are in double quotes (""). Check your final JSON for validity before outputting.
      {
        "destinationName": "${destination}",
        "fromName": "${from}",
        "fromCoords": ${JSON.stringify(fromCoords)},
        "destinationCoords": ${JSON.stringify(destCoords)},
        "travelAnalysis": {
          "summary": "Based on real data, here are the travel options...",
          "distance": "${travelData.distance}", // String or Number
          "options": ${JSON.stringify(travelData.options)}
        },
        "destinationSummary": {
          "bestTimeToVisit": "${destinationInfo.bestTime}", // String
          "hotelSuggestions": ${JSON.stringify(destinationInfo.hotels)} // Array
        },
        "thoughtProcess": "...", // String
        "days": [
          // START: Generate EXACTLY ${numberOfDays} day objects below.
          {
            "day": 1, // Number
            "date": "${calculatedDays > 0 ? allDates[0] : startDate}", // String: YYYY-MM-DD Use calculated date
            "title": "Travel and Arrival", // String
            "activities": [ // Array of objects
              { "time": "Morning/Afternoon", "description": "Travel from ${from} to ${destination} via [Logical Mode from data]. Estimated time: [Time string]." },
              { "time": "Evening", "description": "Arrive in ${destination}, check into hotel (Suggestion: ${destinationInfo.hotels.length > 0 ? destinationInfo.hotels[0].name : `a ${budget} hotel`}) and have dinner." }
            ]
          },
          // CONTINUE generating Day 2, Day 3, ..., Day ${calculatedDays > 0 ? calculatedDays : '?'} here.
          // Example for Day 2:
          {
             "day": 2, // Number
             "date": "${calculatedDays > 1 ? allDates[1] : '[Calculate YYYY-MM-DD for Day 2]'}", // String: YYYY-MM-DD Use calculated date
             "title": "[Title for Day 2]", // String
             "activities": [ // Array of objects
               { "time": "Morning", "description":"..." },
               { "time": "Afternoon", "description":"..." },
               { "time": "Evening", "description":"..." }
             ]
           }
          // ... generate ALL remaining days up to the end date ...
          // END: Ensure exactly ${numberOfDays} day objects were generated.
        ]
      }
    `;
    // --- **** END OF PROMPT FIX **** ---


    // --- Call AI and Stream ---
    try {
      const responseStream = await ollama.chat({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
      const readableStream = ollamaStreamToReadableStream(responseStream);
      return new Response(readableStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' }, });
    } catch (error) {
      console.error('Itinerary streaming error:', error);
      return new Response( JSON.stringify({ error: 'Failed to generate itinerary stream. Is Ollama running?' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
// --- END POST FUNCTION ---
// --- NO OTHER EXPORTS ---