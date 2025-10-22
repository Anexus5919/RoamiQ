// /app/page.js
'use client'; 

import { useState, Suspense } from 'react'; 
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import WeatherDisplay from './components/WeatherDisplay';
import TravelAnalysisDisplay from './components/TravelAnalysisDisplay';
import HotelSuggestions from './components/HotelSuggestions';
import ChainOfThoughtDisplay from './components/ChainOfThoughtDisplay';

// This helper function finds the JSON block within a messy string
function extractJson(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }
  
  return text.substring(firstBrace, lastBrace + 1);
}

// Define the initial CoT steps
const initialCotSteps = [
  { id: 'travel', text: 'Analyzing travel logistics...', status: 'pending' },
  { id: 'dest', text: 'Gathering destination info (hotels, best time)...', status: 'pending' },
  { id: 'plan', text: 'Building your day-by-day plan...', status: 'pending' },
];

function ItineraryBuilder() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [streamingText, setStreamingText] = useState(''); // The raw JSON
  const [cotSteps, setCotSteps] = useState(initialCotSteps); // The CoT UI

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setStreamingText('');
    setCotSteps(initialCotSteps); 

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

      if (!response.body) {
        throw new Error('Response body is missing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // This is the simultaneous streaming logic
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setCotSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'done' })));
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        
        setStreamingText(fullResponse); 
        
        setCotSteps(prevSteps => {
          const newSteps = JSON.parse(JSON.stringify(prevSteps)); 
          
          if (fullResponse.includes('"travelAnalysis":')) {
            newSteps[0].status = 'loading'; 
          }
          if (fullResponse.includes('"destinationSummary":')) {
            newSteps[0].status = 'done';
            newSteps[1].status = 'loading';
          }
          if (fullResponse.includes('"hotelSuggestions":')) {
            newSteps[1].text = 'Gathering destination info (found hotels!)';
          }
          if (fullResponse.includes('"days":')) {
            newSteps[1].status = 'done';
            newSteps[2].status = 'loading';
          }
          
          const dayMatch = fullResponse.match(/"day": (\d+)/g);
          if (dayMatch) {
            const lastDay = dayMatch[dayMatch.length - 1];
            const dayNum = lastDay.split(': ')[1];
            newSteps[2].text = `Building your plan... (Day ${dayNum})`;
          }
          
          return newSteps;
        });
      }

      const jsonString = extractJson(fullResponse);

      if (!jsonString) {
        throw new Error("Failed to find valid JSON in the AI's response.");
      }

      try {
        const finalJson = JSON.parse(jsonString);
        setItinerary(finalJson);
        setStreamingText(''); 
      } catch (parseError) {
        console.error("JSON parsing error after extraction:", parseError);
        setError("Failed to parse AI response, even after cleaning. The AI output was malformed.");
        setStreamingText(fullResponse);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
      {/* Form is in its OWN narrow container */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-700 mb-8">
          Create Your Perfect Trip
        </h1>
        <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </div>

      {/* --- THIS IS THE FIX --- */}
      {/* The Loading/Streaming/Error UI is now in its OWN centered container */}
      <div className="max-w-2xl mx-auto mt-6 space-y-6">
        {/* Show this while loading (and not yet streaming) */}
        {isLoading && streamingText.length === 0 && (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Starting the AI engine...</p>
          </div>
        )}

        {/* Show the CoT as soon as streaming starts */}
        {streamingText.length > 0 && !itinerary && (
          <ChainOfThoughtDisplay steps={cotSteps} rawJson={streamingText} />
        )}

        {/* Show the error message here */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>

      {/* --- THIS IS THE FIX --- */}
      {/* The final results ONLY render when the itinerary is ready */}
      {itinerary && (
        <div className="max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-6">
              <WeatherDisplay city={itinerary.destinationName} />
              <TravelAnalysisDisplay analysis={itinerary.travelAnalysis} />
              <ItineraryDisplay itinerary={itinerary} />
            </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-1 space-y-6">
              <HotelSuggestions hotels={itinerary.destinationSummary?.hotelSuggestions} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// The default export now wraps our client component in Suspense
export default function Home() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading form...</div>}>
      <ItineraryBuilder />
    </Suspense>
  );
}