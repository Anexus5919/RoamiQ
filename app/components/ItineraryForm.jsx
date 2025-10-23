// /app/components/ItineraryForm.jsx
'use client';
// ... (keep all the imports and logic from before) ...
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ItineraryForm({ onSubmit, isLoading }) {
  // ... (keep all the state and handlers) ...
  const searchParams = useSearchParams();
  const prefilledDestination = searchParams.get('destination');
  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('Mid-range');
  const [transportMode, setTransportMode] = useState('Flight');
  const [interests, setInterests] = useState('');

  useEffect(() => {
    if (prefilledDestination) {
      setDestination(prefilledDestination);
    }
  }, [prefilledDestination]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);
    onSubmit({ 
      from, 
      destination, 
      startDate, 
      endDate, 
      budget, 
      transportMode, 
      interests: interestsArray 
    });
  };

  // --- ADDED DARK MODE STYLES to inputClass ---
  const inputClass = "mt-4 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100";

  return (
    // --- ADDED DARK MODE STYLES to form ---
    <form 
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-7"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* --- ADDED DARK MODE STYLES to label --- */}
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </label>
          <input
            type="text"
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="e.g., New York, USA"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, France"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Budget
          </label>
          <select
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass}
          >
            <option>Budget</option>
            <option>Mid-range</option>
            <option>Luxury</option>
          </select>
        </div>
        <div>
          <label htmlFor="transportMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Main Transport
          </label>
          <select
            id="transportMode"
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className={inputClass}
          >
            <option>Flight</option>
            <option>Train</option>
            <option>Car</option>
            <option>Any</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Interests (comma-separated)
        </label>
        <input
          type="text"
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g., food, history, art, hiking"
          required
          className={inputClass}
        />
      </div>

      {/* Button styles are fine as-is */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Build My Itinerary'}
      </button>
    </form>
  );
}