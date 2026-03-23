import { useState, useEffect } from 'react';

export function useEnvironment() {
  const [data, setData] = useState({ city: null, weather: null, temp: null, loading: true, error: null });

  useEffect(() => {
    // Check session cache first so we don't spam the free APIs
    const cached = sessionStorage.getItem("env_data");
    if (cached) {
      setData(JSON.parse(cached));
      return;
    }

    if (!("geolocation" in navigator)) {
      setData(prev => ({ ...prev, loading: false, error: "Geolocation not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Fetch City bounds using public BigDataCloud Reverse Geo API (No Key Required)
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || geoData.principalSubdivision || "Unknown";

          // Fetch accurate weather points using standard Open-Meteo API
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const temp = Math.round(weatherData.current_weather.temperature);
          const weatherCode = weatherData.current_weather.weathercode;

          // Map European localized weather codes to standard emojis
          let weatherEmoji = "🌤️";
          if (weatherCode <= 3) weatherEmoji = "☀️"; // Clear/Cloudy
          else if (weatherCode <= 48) weatherEmoji = "🌫️"; // Fog
          else if (weatherCode <= 67) weatherEmoji = "🌧️"; // Rain
          else if (weatherCode <= 77) weatherEmoji = "❄️"; // Snow
          else if (weatherCode <= 82) weatherEmoji = "🌧️"; // Showers
          else if (weatherCode <= 86) weatherEmoji = "❄️"; // Snow showers
          else weatherEmoji = "⛈️"; // Thunderstorm

          const result = { city, weather: weatherEmoji, temp, lat: latitude, lon: longitude, loading: false, error: null };
          sessionStorage.setItem("env_data", JSON.stringify(result));
          setData(result);
        } catch (err) {
          setData(prev => ({ ...prev, loading: false, error: "Failed to fetch environment data" }));
        }
      },
      (err) => {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    );
  }, []);

  return data;
}
