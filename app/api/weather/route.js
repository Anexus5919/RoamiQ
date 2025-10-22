// /app/api/weather/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 });
  }

  const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const weatherResponse = await fetch(WEATHER_URL);
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await weatherResponse.json();

    // Send back only the data we need
    const simplifiedData = {
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      city: data.name,
    };

    return NextResponse.json(simplifiedData);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}