'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function WeatherWidget({ lat, lng }) {
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    if (!lat || !lng) return;
    (async () => {
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation_probability,temperature_2m&forecast_days=1`);
      setForecast(res.data);
    })();
  }, [lat, lng]);

  if (!forecast) return null;
  const rainChance = forecast?.hourly?.precipitation_probability?.[0] || 0;
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
      <span>Today's Weather: {rainChance > 30 ? "Rainy ☔️" : "Clear ☀️"}</span>
      <span>Temp: {forecast?.hourly?.temperature_2m?.[0]}°C</span>
    </div>
  );
}
