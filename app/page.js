// /app/page.js
'use client';

// Removed useState, using context hook instead
import { Suspense } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import WeatherDisplay from './components/WeatherDisplay';
import TravelAnalysisDisplay from './components/TravelAnalysisDisplay';
import HotelSuggestions from './components/HotelSuggestions';
import ChainOfThoughtDisplay from './components/ChainOfThoughtDisplay';
// Import the custom hook to use the shared itinerary state
import { useItinerary } from './context/ItineraryContext'; // Verify path if needed

// Helper function to extract JSON (keep as is)
function extractJson(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }
  return text.substring(firstBrace, lastBrace + 1);
}

// Initial CoT steps definition (keep as is)
const initialCotSteps = [
  { id: 'travel', text: 'Analyzing travel logistics...', status: 'pending' },
  { id: 'dest', text: 'Gathering destination info (hotels, best time)...', status: 'pending' },
  { id: 'plan', text: 'Building your day-by-day plan...', status: 'pending' },
];

// Main component using the context
function ItineraryBuilder() {
  // Get all state variables and setters from the global context
  const {
    itinerary, setItinerary,
    isLoading, setIsLoading,
    error, setError,
    streamingText, setStreamingText,
    cotSteps, setCotSteps
  } = useItinerary();

  // handleFormSubmit logic remains largely the same, but uses setters from context
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null); // Clear context state
    setStreamingText(''); // Clear context state
    setCotSteps(initialCotSteps); // Reset context state

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json(); throw new Error(errData.error || 'Something went wrong');
      }
      if (!response.body) { throw new Error('Response body is missing'); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Update context state
          setCotSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'done' })));
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingText(fullResponse); // Update context state

        // Update context state based on stream progress
        setCotSteps(prevSteps => {
          const newSteps = JSON.parse(JSON.stringify(prevSteps));
          if (fullResponse.includes('"travelAnalysis":')) { newSteps[0].status = 'loading'; }
          if (fullResponse.includes('"destinationSummary":')) { newSteps[0].status = 'done'; newSteps[1].status = 'loading'; }
          if (fullResponse.includes('"hotelSuggestions":')) { newSteps[1].text = 'Gathering destination info (found hotels!)'; }
          if (fullResponse.includes('"days":')) { newSteps[1].status = 'done'; newSteps[2].status = 'loading'; }
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
      if (!jsonString) { throw new Error("Failed to find valid JSON in the AI's response."); }

      try {
        const finalJson = JSON.parse(jsonString);
        setItinerary(finalJson); // Update context state
        setStreamingText(''); // Update context state
      } catch (parseError) {
        console.error("JSON parsing error after extraction:", parseError);
        setError("Failed to parse AI response..."); // Update context state
        setStreamingText(fullResponse); // Update context state
      }
    } catch (err) {
      setError(err.message); // Update context state
    } finally {
      setIsLoading(false); // Update context state
    }
  };

  // The JSX structure remains the same, but reads state from context
  return (
    <>
      {/* Form Section */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 mb-8">
          Create Your Perfect Trip
        </h1>
        {/* Pass isLoading from context */}
        <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </div>

      {/* Loading/Streaming/Error Section - Reads from context */}
      <div className="max-w-2xl mx-auto mt-6 space-y-6">
        {isLoading && streamingText.length === 0 && (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-300">Starting the AI engine...</p>
          </div>
        )}
        {streamingText.length > 0 && !itinerary && (
          <ChainOfThoughtDisplay steps={cotSteps} rawJson={streamingText} />
        )}
        {error && (
          <div className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded-md mt-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>

      {/* Final Results Section - Reads from context */}
      {itinerary && (
        <div className="max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WeatherDisplay city={itinerary.destinationName} />
              <TravelAnalysisDisplay analysis={itinerary.travelAnalysis} />
              <ItineraryDisplay itinerary={itinerary} />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <HotelSuggestions hotels={itinerary.destinationSummary?.hotelSuggestions} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Default export wraps the main component in Suspense
export default function Home() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading form...</div>}>
      <ItineraryBuilder />
    </Suspense>
  );
}