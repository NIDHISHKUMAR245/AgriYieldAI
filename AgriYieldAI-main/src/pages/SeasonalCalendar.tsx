import { useState } from "react";
import { SEASONAL_CROPS, SEASON_META, MONTH_NAMES, Season } from "@/lib/seasonalData";
import { Calendar, Droplets, MapPin, Clock, ChevronDown, ChevronUp, Info } from "lucide-react";

const SEASONS: Season[] = ["Kharif", "Rabi", "Zaid", "Perennial"];

const WATER_COLORS = {
  Low: "text-amber-700 bg-amber-50",
  Moderate: "text-blue-700 bg-blue-50",
  High: "text-brand-700 bg-brand-50",
};

function MonthBar({ sowingMonths, harvestMonths }: { sowingMonths: number[]; harvestMonths: number[] }) {
  return (
    <div className="mt-3">
      <div className="flex gap-0.5">
        {MONTH_NAMES.map((m, i) => {
          const month = i + 1;
          const isSowing = sowingMonths.includes(month);
          const isHarvest = harvestMonths.includes(month);
          return (
            <div key={m} className="flex-1 flex flex-col gap-0.5">
              <div className={`h-4 rounded-sm text-center leading-4 text-xs font-medium transition-colors ${
                isSowing ? "bg-brand-500" : "bg-brand-50"
              }`} />
              <div className={`h-4 rounded-sm ${isHarvest ? "bg-amber-400" : "bg-amber-50"}`} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-0.5 mt-1">
        {MONTH_NAMES.map((m) => (
          <div key={m} className="flex-1 text-center text-xs text-muted-foreground" style={{ fontSize: "9px" }}>{m}</div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-brand-500" />
          <span className="text-xs text-muted-foreground">Sowing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span className="text-xs text-muted-foreground">Harvest</span>
        </div>
      </div>
    </div>
  );
}

function CropCard({ crop }: { crop: typeof SEASONAL_CROPS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const seasonMeta = SEASON_META[crop.season];

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{crop.emoji}</span>
            <div>
              <h3 className="font-heading font-700 text-lg text-foreground leading-tight">{crop.displayName}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${seasonMeta.color} ${seasonMeta.bg}`}>
                <Calendar className="w-3 h-3" />
                {seasonMeta.label}
              </span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${WATER_COLORS[crop.waterRequirement]}`}>
            <Droplets className="w-3 h-3 inline mr-1" />
            {crop.waterRequirement} Water
          </div>
        </div>

        {/* Month bar */}
        <MonthBar sowingMonths={crop.sowingMonths} harvestMonths={crop.harvestMonths} />

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex items-start gap-1.5 bg-brand-50 rounded-xl p-2.5">
            <Clock className="w-3.5 h-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-xs font-semibold text-foreground">{crop.durationDays}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 bg-earth-50 rounded-xl p-2.5">
            <Info className="w-3.5 h-3.5 text-earth-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Soil Type</p>
              <p className="text-xs font-semibold text-foreground leading-tight">{crop.soilType.split(",")[0]}</p>
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="mt-3 flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {crop.regions.slice(0, 3).join(" · ")}
            {crop.regions.length > 3 && ` +${crop.regions.length - 3} more`}
          </p>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 text-brand-600 text-xs font-semibold rounded-xl hover:bg-brand-50 transition-colors"
        >
          {expanded ? (
            <>Hide Tips <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>View Growing Tips <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {/* Expanded tips */}
      {expanded && (
        <div className="border-t border-border bg-brand-950 p-4 animate-fade-in">
          <p className="text-brand-300 text-xs font-semibold mb-3">Growing Tips for {crop.displayName}</p>
          <div className="space-y-2">
            {crop.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 bg-brand-700 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-200 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-brand-200 text-xs leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          {/* Full soil type */}
          <div className="mt-3 pt-3 border-t border-brand-800">
            <p className="text-brand-400 text-xs">
              <span className="text-brand-300 font-semibold">Soil: </span>
              {crop.soilType}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SeasonalCalendar() {
  const [activeSeasons, setActiveSeasons] = useState<Season[]>(["Kharif", "Rabi", "Zaid", "Perennial"]);

  function toggleSeason(s: Season) {
    setActiveSeasons((prev) =>
      prev.includes(s) ? (prev.length > 1 ? prev.filter((x) => x !== s) : prev) : [...prev, s]
    );
  }

  const filteredCrops = SEASONAL_CROPS.filter((c) => activeSeasons.includes(c.season));

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="bg-brand-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-brand-400 text-sm font-medium">India Agricultural Calendar</span>
          </div>
          <h1 className="font-heading text-4xl font-700 text-white mb-2">Seasonal Crop Calendar</h1>
          <p className="text-brand-300 text-lg max-w-xl">
            Optimal sowing and harvest windows for all 15 supported crops across kharif, rabi, zaid, and perennial seasons.
          </p>

          {/* Season legend */}
          <div className="flex flex-wrap gap-3 mt-6">
            {SEASONS.map((s) => {
              const meta = SEASON_META[s];
              const active = activeSeasons.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? `${meta.bg} ${meta.color} border-2 ${meta.border}`
                      : "bg-brand-900 text-brand-400 border-2 border-brand-800 hover:border-brand-600"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {meta.label}
                  <span className="text-xs opacity-70">({meta.months})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Season description cards */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONS.map((s) => {
              const meta = SEASON_META[s];
              const count = SEASONAL_CROPS.filter((c) => c.season === s).length;
              return (
                <div key={s} className={`rounded-xl p-4 border ${meta.border} ${meta.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-sm ${meta.color}`}>{meta.label}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.color} bg-white`}>{count} crops</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{meta.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crop Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-700 text-2xl text-foreground">
            {filteredCrops.length} Crops Shown
          </h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-brand-500 rounded-sm" />
              Sowing months
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-400 rounded-sm" />
              Harvest months
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrops.map((crop) => (
            <CropCard key={crop.name} crop={crop} />
          ))}
        </div>
      </div>

      <footer className="bg-brand-950 py-8 text-center mt-10">
        <p className="text-brand-400 text-sm">
          AgriYield AI · Seasonal Calendar · Data sourced from ICAR & FAOSTAT India
        </p>
      </footer>
    </div>
  );
}
