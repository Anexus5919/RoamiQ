// /app/components/WeatherDisplay.jsx
'use client';

import { useState, useEffect } from 'react';

export default function WeatherDisplay({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setError(null);

    // --- THIS IS THE FIX ---
    // We split "Kyoto, Japan" and just take "Kyoto".
    // This makes the API call much more reliable.
    const cleanCity = city.split(',')[0].trim();
    // -----------------------

    fetch(`/api/weather?city=${encodeURIComponent(cleanCity)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Weather data not found.');
        }
        return res.json();
      })
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [city]); // This effect re-runs whenever the 'city' prop changes

  if (loading) {
    return <div className="p-4 bg-white rounded-lg shadow-md text-sm text-gray-600">Loading weather...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 rounded-lg shadow-md text-sm text-red-700">Could not load weather for {city}.</div>;
  }

  if (!weather) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4">
      <img src={weather.icon} alt={weather.description} className="w-12 h-12" />
      <div>
        <p className="text-lg font-semibold text-gray-800">Current Weather in {weather.city}</p>
        <p className="text-gray-600">{Math.round(weather.temp)}°C, {weather.description}</p>
      </div>
    </div>
  );
}