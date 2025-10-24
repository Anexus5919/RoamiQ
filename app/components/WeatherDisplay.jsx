// /app/components/WeatherDisplay.jsx
'use client';
import { useState, useEffect } from 'react';
import { Cloud, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function WeatherDisplay({ city }) {
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
    return (
      <Card>
        <CardContent className="p-6 flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading weather...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive">Could not load weather data</span>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 flex items-center space-x-4">
        {weather.icon ? (
          <img src={weather.icon} alt={weather.description} className="w-16 h-16" />
        ) : (
          <Cloud className="h-16 w-16 text-primary" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Current Weather in {weather.city}</h3>
          <p className="text-muted-foreground">
            {Math.round(weather.temp)}°C, {weather.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}