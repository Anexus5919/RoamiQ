// /app/page.js
'use client';

import { useState } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import WeatherDisplay from './components/WeatherDisplay';

export default function Home() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // --- NEW STATE ---
  // This will hold the raw, incoming text from the stream
  const [streamingText, setStreamingText] = useState('');

  // --- THIS FUNCTION IS COMPLETELY REWRITTEN ---
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setStreamingText(''); // Clear previous stream

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Something went wrong');
      }

      // Check if the response body is available
      if (!response.body) {
        throw new Error('Response body is missing');
      }

      // --- MANUAL STREAM READER ---
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream finished
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingText(fullResponse); // Update state to show live "parsing"
      }

      // --- PARSE THE FINAL, COMPLETE JSON STRING ---
      // We wrap this in a try/catch in case the AI added
      // any extra text that wasn't perfect JSON
      try {
        const finalJson = JSON.parse(fullResponse);
        setItinerary(finalJson);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        setError("Failed to parse AI response. The AI may have included non-JSON text.");
        setStreamingText(fullResponse); // Show the raw, broken text for debugging
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading *after* stream is done
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
        Create Your Perfect Trip
      </h1>
      <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {/* Loading Spinner - now only shows while form is locked */}
      {isLoading && !streamingText && (
        <div className="flex justify-center items-center mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Starting the AI engine...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* --- NEW UI: LIVE STREAMING BOX --- */}
      {/* This box shows the "continuous parsing" effect */}
      {streamingText && !itinerary && (
        <div className="mt-6 bg-gray-900 text-white p-4 rounded-lg shadow-md font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">🤖 AI Stream (Live)</h3>
          <pre>{streamingText}</pre>
        </div>
      )}

      {/* Results - This only appears *after* the stream is finished and parsed */}
      {itinerary && (
        <div className="mt-6 space-y-6">
          <WeatherDisplay city={itinerary.destination} />
          <ItineraryDisplay itinerary={itinerary} />
        </div>
      )}
    </div>
  );
}