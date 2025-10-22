// /app/components/ItineraryForm.jsx
'use client';

import { useState } from 'react';

export default function ItineraryForm({ onSubmit, isLoading }) {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);
    onSubmit({ destination, dates, interests: interestsArray });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md space-y-4"
    >
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
          Destination
        </label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g., Paris, France"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="dates" className="block text-sm font-medium text-gray-700">
          Travel Dates
        </label>
        <input
          type="text"
          id="dates"
          value={dates}
          onChange={(e) => setDates(e.target.value)}
          placeholder="e.g., July 10th - July 17th"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
          Interests (comma-separated)
        </label>
        <input
          type="text"
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g., food, history, art, hiking"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

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