import { useState, useCallback } from "react";
import { CROP_PROFILES, CROP_MAP, predictYield } from "@/lib/cropData";
import { CropInputs, PredictionResult } from "@/types";
import CropParameterSlider from "@/components/features/CropParameterSlider";
import { Sprout, ChevronDown, Loader2 } from "lucide-react";

interface Props {
  onResult: (result: PredictionResult, inputs: CropInputs) => void;
  onWeatherApplyRef?: (fn: (d: { temperature: number; humidity: number; rainfall: number }) => void) => void;
}

const defaultInputs: CropInputs = {
  crop: "maize",
  N: 90,
  P: 45,
  K: 35,
  temperature: 25,
  humidity: 70,
  ph: 6.5,
  rainfall: 100,
};

export default function PredictionForm({ onResult, onWeatherApplyRef }: Props) {
  const [inputs, setInputs] = useState<CropInputs>(defaultInputs);
  const [loading, setLoading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);

  // Register the weather apply handler so parent can call it
  const applyWeather = useCallback((d: { temperature: number; humidity: number; rainfall: number }) => {
    setInputs((prev) => ({
      ...prev,
      temperature: Math.round(d.temperature * 10) / 10,
      humidity: Math.round(d.humidity),
      rainfall: Math.max(20, Math.min(300, Math.round(d.rainfall) || 50)),
    }));
  }, []);

  // Register callback on mount and whenever it changes
  useState(() => {
    if (onWeatherApplyRef) onWeatherApplyRef(applyWeather);
  });

  const profile = CROP_MAP[inputs.crop];

  function handleSlider(name: string, value: number) {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  function handleCropSelect(crop: string) {
    setInputs((prev) => ({ ...prev, crop }));
    setCropOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate ML inference delay
    await new Promise((r) => setTimeout(r, 1800));
    const result = predictYield(inputs);
    setLoading(false);
    onResult(result, inputs);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Crop Selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Select Crop</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCropOpen(!cropOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-border rounded-xl hover:border-brand-400 focus:border-brand-500 focus:outline-none transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{profile?.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-foreground">{profile?.displayName}</p>
                <p className="text-xs text-muted-foreground">{profile?.description}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cropOpen ? "rotate-180" : ""}`} />
          </button>

          {cropOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
              {CROP_PROFILES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCropSelect(c.name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50 transition-colors ${
                    inputs.crop === c.name ? "bg-brand-50 text-brand-700" : ""
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-sm font-medium">{c.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NPK Section */}
      <div className="bg-soil-100 rounded-2xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-600 text-white rounded-md flex items-center justify-center text-xs font-bold">N</span>
          Soil Nutrients (kg/ha)
        </h3>
        <CropParameterSlider
          label="Nitrogen (N)"
          name="N"
          value={inputs.N}
          min={0}
          max={160}
          step={1}
          unit="kg/ha"
          idealRange={profile?.idealN}
          onChange={handleSlider}
          description="Primary macronutrient for leaf growth"
        />
        <CropParameterSlider
          label="Phosphorus (P)"
          name="P"
          value={inputs.P}
          min={5}
          max={145}
          step={1}
          unit="kg/ha"
          idealRange={profile?.idealP}
          onChange={handleSlider}
          description="Root development and flowering"
        />
        <CropParameterSlider
          label="Potassium (K)"
          name="K"
          value={inputs.K}
          min={5}
          max={205}
          step={1}
          unit="kg/ha"
          idealRange={profile?.idealK}
          onChange={handleSlider}
          description="Disease resistance and water regulation"
        />
      </div>

      {/* Climate Section */}
      <div className="bg-blue-50 rounded-2xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center text-xs">🌡</span>
          Climate Conditions
        </h3>
        <CropParameterSlider
          label="Temperature"
          name="temperature"
          value={inputs.temperature}
          min={10}
          max={42}
          step={0.5}
          unit="°C"
          idealRange={profile?.idealTemp}
          onChange={handleSlider}
          description="Average growing season temperature"
        />
        <CropParameterSlider
          label="Humidity"
          name="humidity"
          value={inputs.humidity}
          min={14}
          max={100}
          step={1}
          unit="%"
          idealRange={profile?.idealHumidity}
          onChange={handleSlider}
          description="Relative air humidity"
        />
        <CropParameterSlider
          label="Rainfall"
          name="rainfall"
          value={inputs.rainfall}
          min={20}
          max={300}
          step={1}
          unit="mm"
          idealRange={profile?.idealRainfall}
          onChange={handleSlider}
          description="Average seasonal rainfall"
        />
      </div>

      {/* Soil pH */}
      <div className="bg-earth-50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-earth-600 text-white rounded-md flex items-center justify-center text-xs font-bold">pH</span>
          Soil Acidity
        </h3>
        <CropParameterSlider
          label="Soil pH"
          name="ph"
          value={inputs.ph}
          min={3.5}
          max={9.5}
          step={0.1}
          unit=""
          idealRange={profile?.idealPh}
          onChange={handleSlider}
          description="5.5–7.0 neutral range suitable for most crops"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Acidic</span>
          <span>Neutral</span>
          <span>Alkaline</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-600 text-white font-heading font-700 text-lg rounded-2xl hover:bg-brand-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-98 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Running XGBoost Model...
          </>
        ) : (
          <>
            <Sprout className="w-5 h-5" />
            Predict Crop Yield
          </>
        )}
      </button>
    </form>
  );
}
