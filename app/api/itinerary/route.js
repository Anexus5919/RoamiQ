// /app/api/itinerary/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { destination, dates, interests } = await request.json();

  // --- This prompt is CRITICAL ---
  // It forces the AI to return ONLY a JSON object
  // It also includes the "Chain of Thought" bonus
  const prompt = `
    You are an expert travel itinerary planner. A user is planning a trip.
    Destination: ${destination}
    Travel Dates: ${dates}
    Interests: ${interests.join(', ')}

    Generate a detailed, day-by-day travel itinerary.

    You MUST respond with ONLY a valid JSON object. Do not include any text, 
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

    Ensure the itinerary is tailored to the specified interests.
  `;

  try {
    // Send the request to your local Ollama server
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // The model you pulled
        messages: [{ role: 'user', content: prompt }],
        format: 'json', // This is key to force JSON output
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();

    // The AI's response is a JSON *string* in the 'content' field.
    // We need to parse it into a real JSON object.
    const itineraryJson = JSON.parse(data.message.content);

    return NextResponse.json(itineraryJson);

  } catch (error) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary. Is Ollama running?' },
      { status: 500 }
    );
  }
}