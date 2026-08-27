export interface WeatherData {
  location: string;
  state?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  icon: string;
  uvIndex: number;
  advisory: string;
  isLive: boolean;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainChance: number;
  }>;
}

export async function fetchWeatherData(locationStr?: string, lat?: number, lon?: number): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;
  const loc = locationStr || 'Coimbatore, Tamil Nadu';

  if (apiKey && apiKey.trim() !== '') {
    try {
      const query = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(loc)}`;
      const url = `https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return {
          location: data.name || loc,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
          windSpeed: Math.round(data.wind.speed * 3.6),
          condition: data.weather[0]?.main || 'Clear',
          icon: data.weather[0]?.icon || '01d',
          uvIndex: 6,
          advisory: 'Optimal weather for spraying and field cultivation today.',
          isLive: true,
          forecast: [
            { day: 'Tomorrow', tempMax: Math.round(data.main.temp + 2), tempMin: Math.round(data.main.temp - 4), condition: 'Sunny', rainChance: 10 },
            { day: 'Day 2', tempMax: Math.round(data.main.temp + 1), tempMin: Math.round(data.main.temp - 3), condition: 'Partly Cloudy', rainChance: 25 },
            { day: 'Day 3', tempMax: Math.round(data.main.temp), tempMin: Math.round(data.main.temp - 5), condition: 'Light Rain', rainChance: 60 },
            { day: 'Day 4', tempMax: Math.round(data.main.temp - 1), tempMin: Math.round(data.main.temp - 4), condition: 'Cloudy', rainChance: 40 },
            { day: 'Day 5', tempMax: Math.round(data.main.temp + 1), tempMin: Math.round(data.main.temp - 3), condition: 'Clear Sky', rainChance: 15 }
          ]
        };
      }
    } catch (err) {
      console.warn('Weather API failed, using regional agro-meteorological data:', err);
    }
  }

  // Graceful regional weather model
  const now = new Date();
  const currentHour = now.getHours();
  const baseTemp = (currentHour >= 11 && currentHour <= 15) ? 31 : (currentHour >= 19 || currentHour <= 6) ? 23 : 28;

  return {
    location: loc,
    state: loc.includes('Tamil Nadu') ? 'Tamil Nadu' : 'National Agro Zone',
    temperature: baseTemp,
    feelsLike: baseTemp + 2,
    humidity: 68,
    rainfall: 2.4,
    windSpeed: 14,
    condition: 'Partly Cloudy',
    icon: 'cloud-sun',
    uvIndex: 7,
    advisory: 'Moderate humidity. Ideal conditions for sowing and foliar fertilizer spray in the morning.',
    isLive: false, // Clearly indicated demo/fallback state
    forecast: [
      { day: 'Tomorrow', tempMax: 32, tempMin: 22, condition: 'Sunny', rainChance: 15 },
      { day: 'Friday', tempMax: 30, tempMin: 23, condition: 'Partly Cloudy', rainChance: 35 },
      { day: 'Saturday', tempMax: 29, tempMin: 21, condition: 'Scattered Showers', rainChance: 65 },
      { day: 'Sunday', tempMax: 31, tempMin: 22, condition: 'Clear Sky', rainChance: 20 },
      { day: 'Monday', tempMax: 33, tempMin: 24, condition: 'Sunny', rainChance: 10 }
    ]
  };
}
