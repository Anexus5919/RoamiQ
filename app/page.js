// /app/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import WeatherDisplay from './components/WeatherDisplay';
import TravelAnalysisDisplay from './components/TravelAnalysisDisplay';
import HotelSuggestions from './components/HotelSuggestions';
import ChainOfThoughtDisplay from './components/ChainOfThoughtDisplay';
import GlobeDisplay from './components/GlobeDisplay';
import { useItinerary } from './context/ItineraryContext'; // Uses context

// Helper function to extract JSON
function extractJson(text) {
  if (!text) return null;
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }
  return text.substring(firstBrace, lastBrace + 1);
}

// Initial CoT steps definition
const initialCotSteps = [
  { id: 'travel', text: 'Analyzing travel logistics...', status: 'pending' },
  { id: 'dest', text: 'Gathering destination info (hotels, best time)...', status: 'pending' },
  { id: 'plan', text: 'Building your day-by-day plan...', status: 'pending' },
];

// Main component using the context
function ItineraryBuilder() {
  const {
    itinerary, setItinerary,
    isLoading, setIsLoading,
    error, setError,
    streamingText, setStreamingText,
    cotSteps, setCotSteps
  } = useItinerary();

  // Layout state: 'formOnly', 'loadingCentered', 'resultsSplit', 'errorCentered'
  const [layoutState, setLayoutState] = useState('formOnly');

  // Effect to reset layout
  useEffect(() => {
    if (!itinerary && !isLoading && !streamingText && !error && layoutState !== 'formOnly') {
        setLayoutState('formOnly');
    }
    else if (!error && layoutState === 'errorCentered' && !isLoading) {
         setLayoutState('formOnly');
    }
  }, [itinerary, isLoading, streamingText, error, layoutState]);

  // handleFormSubmit logic
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setLayoutState('loadingCentered');
    setError(null);
    setItinerary(null);
    setStreamingText('');
    setCotSteps(initialCotSteps);

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorPayload = { error: `HTTP error! status: ${response.status}` };
        try { errorPayload = await response.json(); }
        catch (e) { errorPayload.error = response.statusText || errorPayload.error; }
        throw new Error(errorPayload.error || 'Something went wrong');
      }
      if (!response.body) { throw new Error('Response body is missing'); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // Streaming Logic
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setCotSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'done' })));
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingText(fullResponse);

        // Update CoT steps
        setCotSteps(prevSteps => {
            const newSteps = JSON.parse(JSON.stringify(prevSteps));
             if (fullResponse.includes('"travelAnalysis":')) { newSteps[0].status = 'loading'; }
             if (fullResponse.includes('"destinationSummary":')) { newSteps[0].status = 'done'; newSteps[1].status = 'loading'; }
             if (fullResponse.includes('"hotelSuggestions":')) { newSteps[1].text = 'Gathering destination info (found hotels!)'; }
             if (fullResponse.includes('"days":')) { newSteps[1].status = 'done'; newSteps[2].status = 'loading'; }
             const dayMatch = fullResponse.match(/"day":\s*(\d+)/g);
             if (dayMatch) {
               const lastDayMatch = dayMatch[dayMatch.length - 1];
               const dayNumMatch = lastDayMatch.match(/\d+/);
               if (dayNumMatch) {
                   const dayNum = dayNumMatch[0];
                   newSteps[2].text = `Building your plan... (Day ${dayNum})`;
               }
             }
            return newSteps;
        });
      } // End While

      const jsonString = extractJson(fullResponse);
      if (!jsonString) { throw new Error("Failed to find valid JSON in the AI's response."); }

      try {
        const finalJson = JSON.parse(jsonString);
        setItinerary(finalJson);
        setStreamingText('');
        setLayoutState('resultsSplit'); // Success state
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        setError("Failed to parse AI response, output might be malformed.");
        setStreamingText(fullResponse);
        setLayoutState('errorCentered'); // Error state
      }
    } catch (err) {
      console.error("Fetch/Submit Error:", err);
      setError(err.message || "An unexpected error occurred during generation.");
      setLayoutState('errorCentered'); // Error state
    } finally {
      setIsLoading(false); // Always stop loading indicator
    }
  };

  return (
    <>
      {/* Main Container */}
      <div className={`mx-auto transition-all duration-700 ease-in-out ${layoutState === 'resultsSplit' ? 'max-w-full' : 'max-w-2xl'}`}>
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 mb-8">
          Create Your Perfect Trip
        </h1>

        {/* --- Layout Grid (Form + Optional Globe) --- */}
        <div className={`grid grid-cols-1 ${layoutState === 'resultsSplit' ? 'lg:grid-cols-12 lg:gap-8 items-stretch' : ''}`}>
          {/* Form Section */}
          <motion.div
            layout transition={{ duration: 0.7, ease: "easeInOut" }}
            className={` ${layoutState === 'resultsSplit' ? 'lg:col-span-5' : 'col-span-1'} h-full flex flex-col min-h-0`}
          >
            <div className="flex-grow">
                 <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          </motion.div>

          {/* --- Right Section (Globe OR CoT/Loading/Error) --- */}
          {/* This section ONLY appears when not in 'formOnly' state */}
          <AnimatePresence>
            {layoutState !== 'formOnly' && (
              <motion.div
                className="lg:col-span-7 mt-6 lg:mt-0 h-full flex flex-col items-center justify-center min-h-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* --- THIS IS THE FIX: Simplified Conditional Rendering --- */}
                {/* Show Globe ONLY if results are ready */}
                {layoutState === 'resultsSplit' && itinerary ? (
                  <div className="w-full h-full">
                    <GlobeDisplay
                      fromCoords={itinerary.fromCoords} destinationCoords={itinerary.destinationCoords}
                      fromName={itinerary.fromName} destinationName={itinerary.destinationName}
                      distance={itinerary.travelAnalysis?.distance}
                    />
                  </div>
                ) : (
                  // Otherwise (loading or error), show the CoT/Loading/Error block
                  <div className="w-full max-w-2xl space-y-6 px-4">
                    {/* Initial Loading Spinner */}
                    {isLoading && streamingText.length === 0 && !error && (
                       <div className="flex justify-center items-center mt-6">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                         <p className="ml-3 text-gray-600 dark:text-gray-300">Starting the AI engine...</p>
                       </div>
                    )}
                    {/* CoT Display */}
                    {streamingText.length > 0 && layoutState === 'loadingCentered' && (
                      <ChainOfThoughtDisplay steps={cotSteps} rawJson={streamingText} />
                    )}
                     {/* Error Display */}
                     {error && (
                       <div className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded-md" role="alert">
                         <strong className="font-bold">Error: </strong>
                         <span className="block sm:inline">{error}</span>
                       </div>
                     )}
                  </div>
                )}
                {/* --- END FIX --- */}
              </motion.div>
            )}
          </AnimatePresence>
        </div> {/* End Form/Globe Grid */}
      </div> {/* End Main Container */}

      {/* Loading/Streaming/Error Section (No longer needed here, moved inside right column) */}

      {/* Final Results Section */}
      <AnimatePresence>
         {layoutState === 'resultsSplit' && itinerary && (
           <motion.div
            className="max-w-7xl mx-auto mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                 <WeatherDisplay city={itinerary.destinationName} />
                 <TravelAnalysisDisplay analysis={itinerary.travelAnalysis} />
                 <ItineraryDisplay itinerary={itinerary} />
              </div>
              <div className="lg:col-span-5 space-y-6">
                 <HotelSuggestions hotels={itinerary.destinationSummary?.hotelSuggestions} />
              </div>
            </div>
          </motion.div>
         )}
      </AnimatePresence>
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