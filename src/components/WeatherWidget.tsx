'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type WeatherWidgetProps = {
  lat?: number | null;
  lng?: number | null;
};

const WeatherWidget = ({ lat, lng }: WeatherWidgetProps) => {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation_probability,temperature_2m&forecast_days=1`
        );
        setForecast(res.data);
      } catch (err) {
        setError("Could not load weather");
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lng]);

  if (loading) return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
      <span>Loading weather...</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm text-red-700">
      <span>Weather unavailable</span>
    </div>
  );

  if (!forecast) return null;

  const rainChance = forecast?.hourly?.precipitation_probability?.[0] || 0;
  const temperature = forecast?.hourly?.temperature_2m?.[0];

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
      <span>
        {rainChance > 30 ? "Rainy ☔️" : "Clear ☀️"}
      </span>
      <span>Temp: {temperature !== undefined ? `${temperature}°C` : "N/A"}</span>
    </div>
  );
};

export default WeatherWidget;
