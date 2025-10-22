// /app/api/itinerary/route.js
import { Ollama } from 'ollama';

// This tells Next.js to use the "edge" runtime, which is optimal for streaming.


// Initialize the Ollama client
// It defaults to http://127.0.0.1:11434, which is correct for you.
const ollama = new Ollama();

// This helper function converts Ollama's stream (an AsyncGenerator)
// into a standard ReadableStream that the browser can understand.
function ollamaStreamToReadableStream(stream) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        // The stream from ollama.chat() gives us objects
        // We need to pull the text content out of each chunk
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk.message.content));
        }
      } catch (e) {
        // Handle any errors that occur during streaming
        controller.error(e);
      } finally {
        // Close the stream when done
        controller.close();
      }
    },
  });
}


export async function POST(request) {
  const { destination, dates, interests } = await request.json();

  const prompt = `
    You are an expert travel itinerary planner. A user is planning a trip.
    Destination: ${destination}
    Travel Dates: ${dates}
    Interests: ${interests.join(', ')}

    Generate a detailed, day-by-day travel itinerary.

    Respond ONLY with a valid JSON object. Do not include any text, 
    markdown, or explanations before or after the JSON.
    The JSON object must have the following structure:
    {
      "destination": "${destination}",
      "thoughtProcess": "A brief (1-2 sentences) chain of thought on how you 
                       built this itinerary based on the user's interests.",
      "days": [
        {
          "day": 1,
          "title": "Arrival and Local Exploration",
          "activities": [
            { "time": "Morning", "description": "Arrive at [Airport/Station], transfer to hotel, and check-in." },
            { "time": "Afternoon", "description": "Light lunch at a local cafe and a brief walk around the hotel area." },
            { "time": "Evening", "description": "Welcome dinner at a restaurant featuring local cuisine." }
          ]
        }
      ]
    }
  `;

  try {
    // Generate the completion stream from Ollama
    // We use the .chat() method with stream: true
    const responseStream = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: true, // This is key!
    });

    // Convert the Ollama-specific stream to a standard ReadableStream
    const readableStream = ollamaStreamToReadableStream(responseStream);

    // Return a standard 'Response' object with the stream
    // Your frontend will read this perfectly.
    return new Response(readableStream, {
      headers: {
        // Set the content type to plain text as we are streaming raw JSON text
        'Content-Type': 'text/plain; charset=utf-8', 
      },
    });

  } catch (error) {
    console.error('Itinerary streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate itinerary stream. Is Ollama running?' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}