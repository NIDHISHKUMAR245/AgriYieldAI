import { useState } from "react";
import { CROP_PROFILES, CROP_MAP, predictYield } from "@/lib/cropData";
import { CropInputs } from "@/types";
import CropParameterSlider from "@/components/features/CropParameterSlider";
import { GitCompare, X, Sprout, TrendingUp, Award, AlertCircle, Target, ChevronDown, Loader2 } from "lucide-react";

const defaultInputs: Omit<CropInputs, "crop"> = {
  N: 90, P: 45, K: 35, temperature: 25, humidity: 70, ph: 6.5, rainfall: 100,
};

function formatYield(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

const categoryColors = {
  Excellent: { text: "text-brand-700", bg: "bg-brand-50", border: "border-brand-300", icon: Award, bar: "#16a34a" },
  High: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", icon: TrendingUp, bar: "#3b82f6" },
  Medium: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", icon: Target, bar: "#f59e0b" },
  Low: { text: "text-red-700", bg: "bg-red-50", border: "border-red-300", icon: AlertCircle, bar: "#ef4444" },
};

const PARAM_LABELS: { key: keyof Omit<CropInputs, "crop">; label: string; unit: string }[] = [
  { key: "N", label: "Nitrogen (N)", unit: "kg/ha" },
  { key: "P", label: "Phosphorus (P)", unit: "kg/ha" },
  { key: "K", label: "Potassium (K)", unit: "kg/ha" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "ph", label: "Soil pH", unit: "" },
  { key: "rainfall", label: "Rainfall", unit: "mm" },
];

const SLIDER_RANGES: Record<string, { min: number; max: number; step: number }> = {
  N: { min: 0, max: 160, step: 1 },
  P: { min: 5, max: 145, step: 1 },
  K: { min: 5, max: 205, step: 1 },
  temperature: { min: 10, max: 42, step: 0.5 },
  humidity: { min: 14, max: 100, step: 1 },
  ph: { min: 3.5, max: 9.5, step: 0.1 },
  rainfall: { min: 20, max: 300, step: 1 },
};

interface CompareResult {
  crop: string;
  displayName: string;
  emoji: string;
  predictedYield: number;
  confidence: number;
  yieldCategory: "Low" | "Medium" | "High" | "Excellent";
  insights: string[];
}

export default function Compare() {
  const [params, setParams] = useState<Omit<CropInputs, "crop">>(defaultInputs);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(["maize", "banana", "chickpea"]);
  const [results, setResults] = useState<CompareResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const maxYield = results ? Math.max(...results.map((r) => r.predictedYield)) : 1;

  function toggleCrop(name: string) {
    setSelectedCrops((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 2) return prev; // min 2
        return prev.filter((c) => c !== name);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, name];
      }
    });
    setResults(null);
  }

  async function handleCompare() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    const res: CompareResult[] = selectedCrops.map((crop) => {
      const profile = CROP_MAP[crop];
      const result = predictYield({ ...params, crop });
      return {
        crop,
        displayName: profile.displayName,
        emoji: profile.emoji,
        predictedYield: result.predictedYield,
        confidence: result.confidence,
        yieldCategory: result.yieldCategory,
        insights: result.insights,
      };
    });
    setResults(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="bg-brand-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <span className="text-brand-400 text-sm font-medium">Side-by-Side Analysis</span>
          </div>
          <h1 className="font-heading text-4xl font-700 text-white mb-2">Crop Yield Comparison</h1>
          <p className="text-brand-300 text-lg max-w-xl">
            Compare 2–3 crops under identical soil and climate conditions to find the best choice for your field.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left Panel — Parameters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crop Selector */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-heading font-700 text-lg text-foreground mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-xs font-bold">1</span>
                Select Crops (2–3)
              </h2>
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-brand-50 border-2 border-brand-200 rounded-xl hover:border-brand-400 transition-colors"
                >
                  <span className="text-sm font-medium text-brand-700">
                    {selectedCrops.length} crops selected — click to change
                  </span>
                  <ChevronDown className={`w-4 h-4 text-brand-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                    {CROP_PROFILES.map((c) => {
                      const selected = selectedCrops.includes(c.name);
                      const disabled = !selected && selectedCrops.length >= 3;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => !disabled && toggleCrop(c.name)}
                          disabled={disabled}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected ? "bg-brand-50" : disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-brand-50"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? "bg-brand-600 border-brand-600" : "border-gray-300"
                          }`}>
                            {selected && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-lg">{c.emoji}</span>
                          <span className="text-sm font-medium">{c.displayName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected chips */}
              <div className="flex flex-wrap gap-2">
                {selectedCrops.map((c) => {
                  const p = CROP_MAP[c];
                  return (
                    <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-100 text-brand-800 rounded-full text-sm font-medium">
                      <span>{p.emoji}</span>
                      <span>{p.displayName}</span>
                      {selectedCrops.length > 2 && (
                        <button onClick={() => toggleCrop(c)} className="ml-1 text-brand-500 hover:text-brand-800 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-heading font-700 text-lg text-foreground mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-xs font-bold">2</span>
                Soil & Climate Inputs
              </h2>
              <div className="space-y-5">
                {PARAM_LABELS.map(({ key, label, unit }) => {
                  const range = SLIDER_RANGES[key];
                  return (
                    <CropParameterSlider
                      key={key}
                      label={label}
                      name={key}
                      value={params[key]}
                      min={range.min}
                      max={range.max}
                      step={range.step}
                      unit={unit}
                      onChange={(name, val) => {
                        setParams((p) => ({ ...p, [name]: val }));
                        setResults(null);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={loading || selectedCrops.length < 2}
              className="w-full flex items-center justify-center gap-3 py-4 bg-brand-600 text-white font-heading font-700 text-lg rounded-2xl hover:bg-brand-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Comparing Crops...
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" />
                  Compare Crops
                </>
              )}
            </button>
          </div>

          {/* Right Panel — Results */}
          <div className="lg:col-span-3">
            {results ? (
              <div className="space-y-6 animate-fade-in">
                {/* Yield Bar Chart */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-heading font-700 text-lg text-foreground mb-5">Predicted Production Yield</h3>
                  <div className="space-y-4">
                    {[...results].sort((a, b) => b.predictedYield - a.predictedYield).map((r) => {
                      const cfg = categoryColors[r.yieldCategory];
                      const CatIcon = cfg.icon;
                      const barPct = (r.predictedYield / maxYield) * 100;
                      return (
                        <div key={r.crop}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{r.emoji}</span>
                              <span className="font-semibold text-foreground">{r.displayName}</span>
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.text} ${cfg.bg}`}>
                                <CatIcon className="w-3 h-3" />
                                {r.yieldCategory}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-heading font-700 text-lg text-foreground">{formatYield(r.predictedYield)}</p>
                              <p className="text-xs text-muted-foreground">tonnes</p>
                            </div>
                          </div>
                          <div className="h-3 bg-brand-50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${barPct}%`, backgroundColor: cfg.bar }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{r.confidence}% model confidence</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Parameter Range Comparison */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-heading font-700 text-lg text-foreground mb-5">Ideal Parameter Ranges vs Your Input</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-brand-100">
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Parameter</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">Your Input</th>
                          {results.map((r) => (
                            <th key={r.crop} className="text-center py-2 px-2">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-lg">{r.emoji}</span>
                                <span className="text-xs font-semibold text-foreground">{r.displayName}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PARAM_LABELS.map(({ key, label, unit }) => (
                          <tr key={key} className="border-b border-border last:border-0">
                            <td className="py-3 pr-4 text-xs font-medium text-foreground">{label}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="font-semibold text-brand-700 text-sm">
                                {params[key]}{unit}
                              </span>
                            </td>
                            {results.map((r) => {
                              const profile = CROP_MAP[r.crop];
                              const idealKey = `ideal${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof profile;
                              const ideal = profile[idealKey] as [number, number] | undefined;
                              const inRange = ideal ? params[key] >= ideal[0] && params[key] <= ideal[1] : true;
                              return (
                                <td key={r.crop} className="py-3 px-2 text-center">
                                  {ideal ? (
                                    <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg text-xs ${inRange ? "bg-brand-50 text-brand-700" : "bg-orange-50 text-orange-700"}`}>
                                      <span className="font-semibold">{ideal[0]}–{ideal[1]}</span>
                                      <span>{inRange ? "✓" : "!"}</span>
                                    </div>
                                  ) : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Per-crop insights */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${results.length}, 1fr)` }}>
                  {results.map((r) => {
                    const cfg = categoryColors[r.yieldCategory];
                    return (
                      <div key={r.crop} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{r.displayName}</p>
                            <p className={`text-xs font-medium ${cfg.text}`}>{r.yieldCategory} Yield</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {r.insights.slice(0, 3).map((ins, i) => (
                            <p key={i} className="text-xs text-foreground leading-relaxed flex items-start gap-1.5">
                              <span className={`mt-0.5 flex-shrink-0 ${ins.startsWith("All") ? "text-brand-600" : "text-orange-500"}`}>
                                {ins.startsWith("All") ? "✓" : "!"}
                              </span>
                              {ins}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Winner banner */}
                {(() => {
                  const winner = [...results].sort((a, b) => b.predictedYield - a.predictedYield)[0];
                  return (
                    <div className="bg-brand-950 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-brand-300 text-xs font-medium mb-0.5">Recommended for These Conditions</p>
                        <p className="text-white font-heading font-700 text-lg">
                          {winner.emoji} {winner.displayName} — {formatYield(winner.predictedYield)} tonnes predicted
                        </p>
                        <p className="text-brand-400 text-xs mt-0.5">Highest yield estimate with {winner.confidence}% model confidence</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-border shadow-sm">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-5">
                  <GitCompare className="w-10 h-10 text-brand-300" />
                </div>
                <h3 className="font-heading font-700 text-xl text-foreground mb-2">Ready to Compare</h3>
                <p className="text-muted-foreground max-w-xs leading-relaxed text-sm">
                  Select 2–3 crops, adjust soil and climate conditions, then click <strong>Compare Crops</strong> to see side-by-side predictions.
                </p>
                <div className="mt-6 flex gap-3">
                  {selectedCrops.map((c) => (
                    <div key={c} className="flex flex-col items-center gap-1">
                      <span className="text-3xl">{CROP_MAP[c]?.emoji}</span>
                      <span className="text-xs text-muted-foreground">{CROP_MAP[c]?.displayName}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {[...Array(selectedCrops.length)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-brand-400 rounded-full" />
                  ))}
                  <span className="text-xs text-brand-600 ml-1 font-medium">{selectedCrops.length} selected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-brand-950 py-8 text-center mt-10">
        <p className="text-brand-400 text-sm">AgriYield AI · Crop Comparison</p>
      </footer>
    </div>
  );
}
