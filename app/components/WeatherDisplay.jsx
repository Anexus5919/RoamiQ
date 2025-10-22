// /app/components/WeatherDisplay.jsx
'use client';
import { useState, useEffect } from 'react';

export default function WeatherDisplay({ city }) {
  // ... (keep all the state and handlers) ...
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setError(null);
    const cleanCity = city.split(',')[0].trim();
    fetch(`/api/weather?city=${encodeURIComponent(cleanCity)}`)
      .then((res) => {
        if (!res.ok) { throw new Error('Weather data not found.'); }
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
  }, [city]);

  if (loading) {
    return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-sm text-gray-600 dark:text-gray-300">Loading weather...</div>;
  }
  if (error) {
    return <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg shadow-md text-sm text-red-700 dark:text-red-300">Could not load weather.</div>;
  }
  if (!weather) return null;

  return (
    // --- ADDED DARK MODE STYLES ---
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center space-x-4">
      <img src={weather.icon} alt={weather.description} className="w-12 h-12" />
      <div>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Current Weather in {weather.city}</p>
        <p className="text-gray-600 dark:text-gray-300">{Math.round(weather.temp)}°C, {weather.description}</p>
      </div>
    </div>
  );
}