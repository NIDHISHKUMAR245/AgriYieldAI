import { useState, useCallback } from "react";
import { Search, MapPin, Loader2, CloudSun, Droplets, Wind, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  rainfall: number;    // 24h precipitation mm
  description: string;
  feelsLike: number;
  windSpeed: number;
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
}

interface Props {
  onWeatherApply: (data: { temperature: number; humidity: number; rainfall: number }) => void;
}

// Uses Open-Meteo (no API key required) + Open-Meteo geocoding
async function geocodeCity(query: string): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return data.results ?? [];
}

async function fetchWeather(lat: number, lon: number): Promise<{
  temperature: number;
  humidity: number;
  rainfall: number;
  windspeed: number;
  weathercode: number;
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const c = data.current;
  return {
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    rainfall: c.precipitation ?? 0,
    windspeed: c.wind_speed_10m,
    weathercode: c.weather_code,
  };
}

function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 9) return "Foggy";
  if (code <= 19) return "Drizzle";
  if (code <= 29) return "Rain";
  if (code <= 39) return "Snow";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 9) return "🌫️";
  if (code <= 29) return "🌧️";
  if (code <= 39) return "❄️";
  if (code <= 59) return "🌦️";
  if (code <= 69) return "🌧️";
  if (code <= 84) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

const INDIA_QUICK_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Lucknow", "Nagpur",
];

export default function WeatherSearch({ onWeatherApply }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const searchCity = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setSearchLoading(true);
    try {
      const results = await geocodeCity(q);
      setSuggestions(results.slice(0, 5));
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  async function selectLocation(geo: GeoResult) {
    setSuggestions([]);
    setQuery(`${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ""}`);
    setLoading(true);
    setError(null);
    setApplied(false);
    try {
      const w = await fetchWeather(geo.latitude, geo.longitude);
      setWeather({
        city: geo.name,
        country: geo.country_code,
        temperature: Math.round(w.temperature * 10) / 10,
        humidity: Math.round(w.humidity),
        rainfall: Math.round(w.rainfall * 10) / 10,
        feelsLike: Math.round(w.temperature * 10) / 10,
        windSpeed: Math.round(w.windspeed),
        description: weatherDescription(w.weathercode),
      });
    } catch {
      setError("Unable to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in this browser");
      return;
    }
    setLocating(true);
    setError(null);
    setApplied(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode using open-meteo nominatim-like API
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
          // Since open-meteo doesn't do reverse geocoding, use lat/lon directly
          const w = await fetchWeather(latitude, longitude);
          setWeather({
            city: "Your Location",
            country: "IN",
            temperature: Math.round(w.temperature * 10) / 10,
            humidity: Math.round(w.humidity),
            rainfall: Math.round(w.rainfall * 10) / 10,
            feelsLike: Math.round(w.temperature * 10) / 10,
            windSpeed: Math.round(w.windspeed),
            description: weatherDescription(w.weathercode),
          });
          setQuery("Current Location");
          toast.success("Weather fetched from your location!");
        } catch {
          setError("Could not fetch weather for your location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Location access denied. Please search by city name.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  function applyWeather() {
    if (!weather) return;
    onWeatherApply({
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall: Math.max(20, Math.min(300, weather.rainfall || 50)),
    });
    setApplied(true);
    toast.success(`Weather data from ${weather.city} applied to predictor!`);
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <CloudSun className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-700 text-base text-foreground">Live Weather Auto-fill</h3>
          <p className="text-xs text-muted-foreground">Powered by Open-Meteo · No API key required</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchCity(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSuggestions([]);
              }}
              placeholder="Search Indian city..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
            )}
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex-shrink-0"
            title="Use my location"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{locating ? "Locating..." : "My Location"}</span>
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-xl z-30 overflow-hidden">
            {suggestions.map((geo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectLocation(geo)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-blue-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{geo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {geo.admin1 ? `${geo.admin1}, ` : ""}{geo.country_code}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick city chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {INDIA_QUICK_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={async () => {
              setQuery(city);
              setSearchLoading(true);
              try {
                const results = await geocodeCity(city);
                if (results.length > 0) await selectLocation(results[0]);
              } finally {
                setSearchLoading(false);
              }
            }}
            className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          >
            {city}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-6 bg-white rounded-xl border border-blue-100">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm text-muted-foreground">Fetching live weather data...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Weather result card */}
      {weather && !loading && (
        <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
          {/* City header */}
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-heading font-700 text-base">{weather.city}</p>
              <p className="text-blue-100 text-xs">{weather.description}</p>
            </div>
            <span className="text-4xl">{weatherEmoji(0)}</span>
          </div>

          {/* Weather metrics */}
          <div className="grid grid-cols-3 gap-0 divide-x divide-blue-100">
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-lg">🌡️</span>
              </div>
              <p className="font-heading font-700 text-xl text-foreground">{weather.temperature}°C</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <p className="font-heading font-700 text-xl text-foreground">{weather.humidity}%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-lg">🌧️</span>
              </div>
              <p className="font-heading font-700 text-xl text-foreground">{weather.rainfall}mm</p>
              <p className="text-xs text-muted-foreground">Rainfall (24h)</p>
            </div>
          </div>

          {/* Extra metrics row */}
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wind className="w-3.5 h-3.5" />
              Wind: {weather.windSpeed} km/h
            </div>
            <p className="text-xs text-muted-foreground">Live data · Open-Meteo</p>
          </div>

          {/* Apply button */}
          <div className="p-4 border-t border-blue-100">
            {applied ? (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                <span className="text-green-600 text-sm font-semibold">✓ Applied to predictor form</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={applyWeather}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <CloudSun className="w-4 h-4" />
                Apply Weather to Predictor
              </button>
            )}
            <p className="text-xs text-center text-muted-foreground mt-2">
              Fills temperature, humidity, and rainfall fields automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
