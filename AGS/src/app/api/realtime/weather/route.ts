import { NextResponse } from 'next/server';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  // Default to Kuala Lumpur if not provided
  const latitude = lat || '3.139';
  const longitude = lon || '101.6869';
  try {
    const url = `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,relative_humidity_2m,weathercode&forecast_days=2`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json({ weather: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
} 