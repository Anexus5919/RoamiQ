// /app/context/ItineraryContext.js
'use client';

import { createContext, useState, useContext } from 'react';

// Create the context
const ItineraryContext = createContext();

// Create a provider component
export function ItineraryProvider({ children }) {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [cotSteps, setCotSteps] = useState([]); // Initialize cotSteps here
  const [formData, setFormData] = useState(null); // Store form data for navigation

  // You can also move the handleFormSubmit logic here if preferred,
  // or keep it in page.js and pass the setters down.
  // For simplicity, we'll pass setters down.

  const value = {
    itinerary, setItinerary,
    isLoading, setIsLoading,
    error, setError,
    streamingText, setStreamingText,
    cotSteps, setCotSteps,
    formData, setFormData
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}

// Create a custom hook to use the context easily
export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}