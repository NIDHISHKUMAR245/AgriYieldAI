import { useState } from "react";
import { PredictionResult } from "@/types";
import { DollarSign, Ruler, TrendingUp, Info } from "lucide-react";

interface Props {
  result: PredictionResult;
}

// MSP (Minimum Support Price) in ₹ per quintal (100 kg) — Govt. of India 2023-24 rates
const MSP_PER_QUINTAL: Record<string, number> = {
  Maize:        1962,
  Banana:       2500,   // Market rate (no MSP; avg wholesale)
  Chickpea:     5440,
  Coconut:      3275,   // per quintal copra equivalent
  Coffee:       12000,  // Arabica MSP approx
  Cotton:       7020,   // Long staple
  Jute:         5050,
  Lentil:       6000,
  Mango:        4000,   // Market rate (no official MSP)
  "Moth Beans": 8558,
  Muskmelon:    1800,   // Market rate
  Orange:       4500,   // Market rate
  Papaya:       1600,   // Market rate
  "Pigeon Peas": 7000,
  Watermelon:   1400,   // Market rate
};

function formatCurrency(val: number): string {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)} L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toLocaleString("en-IN")}`;
}

// Conversion: 1 acre = 0.404686 ha, 1 ha = 2.47105 acres
export default function ProfitEstimator({ result }: Props) {
  const [area, setArea] = useState<number>(1);
  const [unit, setUnit] = useState<"acres" | "hectares">("acres");
  const [priceOverride, setPriceOverride] = useState<string>("");

  const cropKey = result.crop as keyof typeof MSP_PER_QUINTAL;
  const defaultMSP = MSP_PER_QUINTAL[cropKey] ?? 3000;
  const mspPerQuintal = priceOverride ? parseFloat(priceOverride) || defaultMSP : defaultMSP;

  // Convert area to hectares
  const areaHa = unit === "acres" ? area * 0.404686 : area;

  // National production is over India's total cropland (millions ha)
  // We estimate per-hectare yield from national production
  // Approximate India harvested area per crop (million ha) — rough estimates
  const HARVESTED_AREA_MHA: Record<string, number> = {
    Maize: 9.5, Banana: 0.86, Chickpea: 9.2, Coconut: 2.1,
    Coffee: 0.45, Cotton: 12.5, Jute: 0.65, Lentil: 1.5,
    Mango: 2.3, "Moth Beans": 1.8, Muskmelon: 0.5, Orange: 0.65,
    Papaya: 0.75, "Pigeon Peas": 4.8, Watermelon: 0.4,
  };

  const harvestedMha = HARVESTED_AREA_MHA[cropKey] ?? 1;
  const yieldPerHa = result.predictedYield / (harvestedMha * 1_000_000); // tonnes/ha
  const yieldOnFarm = yieldPerHa * areaHa; // tonnes on user's farm
  const yieldQuintals = yieldOnFarm * 10; // 1 tonne = 10 quintals
  const grossRevenue = yieldQuintals * mspPerQuintal;

  // Rough cost of cultivation: ₹25,000–60,000/ha depending on crop
  const COST_PER_HA: Record<string, number> = {
    Maize: 28000, Banana: 85000, Chickpea: 18000, Coconut: 35000,
    Coffee: 65000, Cotton: 55000, Jute: 30000, Lentil: 16000,
    Mango: 45000, "Moth Beans": 12000, Muskmelon: 40000, Orange: 50000,
    Papaya: 60000, "Pigeon Peas": 20000, Watermelon: 45000,
  };

  const costPerHa = COST_PER_HA[cropKey] ?? 30000;
  const totalCost = costPerHa * areaHa;
  const netProfit = grossRevenue - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

  const isProfit = netProfit >= 0;

  const hasCustomMSP = Boolean(priceOverride);
  const isMSP = !hasCustomMSP && [
    "Maize", "Chickpea", "Cotton", "Jute", "Lentil", "Moth Beans", "Pigeon Peas"
  ].includes(cropKey);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-emerald-700" />
        </div>
        <h3 className="font-heading font-700 text-lg text-foreground">Profit Estimator</h3>
        <span className="text-xs text-muted-foreground ml-auto">for {result.crop}</span>
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Land Area */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            <Ruler className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
            Land Area
          </label>
          <div className="flex rounded-xl border-2 border-border overflow-hidden focus-within:border-emerald-400 transition-colors">
            <input
              type="number"
              min={0.1}
              max={10000}
              step={0.1}
              value={area}
              onChange={(e) => setArea(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="flex-1 px-3 py-2.5 text-sm font-semibold text-foreground bg-white focus:outline-none min-w-0"
            />
            <div className="flex border-l border-border">
              {(["acres", "hectares"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-2.5 py-2 text-xs font-semibold transition-colors ${
                    unit === u
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-muted-foreground hover:bg-emerald-50"
                  }`}
                >
                  {u === "acres" ? "ac" : "ha"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ≈ {unit === "acres"
              ? `${(area * 0.404686).toFixed(2)} ha`
              : `${(area * 2.47105).toFixed(2)} acres`}
          </p>
        </div>

        {/* Market Price Override */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Market Price (₹/quintal)
          </label>
          <div className="flex rounded-xl border-2 border-border overflow-hidden focus-within:border-emerald-400 transition-colors">
            <span className="px-2.5 py-2.5 text-sm text-muted-foreground bg-emerald-50 border-r border-border">₹</span>
            <input
              type="number"
              placeholder={String(defaultMSP)}
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm font-semibold text-foreground bg-white focus:outline-none min-w-0"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {isMSP ? (
              <><span className="text-emerald-600 font-semibold">MSP</span> Govt. of India 2023-24</>
            ) : (
              <><span className="text-amber-600 font-semibold">Market rate</span> — edit to update</>
            )}
          </p>
        </div>
      </div>

      {/* Yield estimate */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-emerald-700">Estimated Yield on Your Farm</span>
          <span className="text-xs text-muted-foreground">{yieldPerHa.toFixed(2)} t/ha</span>
        </div>
        <p className="font-heading font-700 text-2xl text-emerald-800">
          {yieldOnFarm < 1
            ? `${(yieldOnFarm * 1000).toFixed(0)} kg`
            : `${yieldOnFarm.toFixed(2)} tonnes`}
          <span className="text-sm font-400 text-muted-foreground ml-2">
            ({yieldQuintals.toFixed(1)} quintals)
          </span>
        </p>
        <p className="text-xs text-emerald-600 mt-1">
          Derived from predicted national yield ({(result.predictedYield / 1_000_000).toFixed(2)}M tonnes) across ~{harvestedMha}M ha
        </p>
      </div>

      {/* Revenue breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between py-2.5 px-4 bg-blue-50 border border-blue-100 rounded-xl">
          <span className="text-sm font-medium text-blue-800">Gross Revenue</span>
          <span className="font-heading font-700 text-blue-700">{formatCurrency(grossRevenue)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 px-4 bg-red-50 border border-red-100 rounded-xl">
          <span className="text-sm font-medium text-red-800">Est. Cost of Cultivation</span>
          <span className="font-heading font-700 text-red-600">− {formatCurrency(totalCost)}</span>
        </div>
        <div className={`flex items-center justify-between py-3 px-4 rounded-xl border-2 ${
          isProfit
            ? "bg-emerald-50 border-emerald-300"
            : "bg-red-50 border-red-300"
        }`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${isProfit ? "text-emerald-600" : "text-red-600"}`} />
            <span className={`text-sm font-bold ${isProfit ? "text-emerald-800" : "text-red-800"}`}>
              Net Profit
            </span>
          </div>
          <div className="text-right">
            <span className={`font-heading font-800 text-xl ${isProfit ? "text-emerald-700" : "text-red-600"}`}>
              {isProfit ? "" : "− "}{formatCurrency(Math.abs(netProfit))}
            </span>
            <p className={`text-xs font-semibold ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
              ROI: {roi.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown per unit */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: `Per ${unit === "acres" ? "acre" : "ha"}`, value: formatCurrency(netProfit / (unit === "acres" ? area : areaHa)) },
          { label: "Per quintal", value: `₹${(mspPerQuintal).toLocaleString("en-IN")}` },
          { label: "Per tonne", value: `₹${(mspPerQuintal * 10).toLocaleString("en-IN")}` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-brand-50 rounded-xl p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-heading font-700 text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Estimates use per-ha yield derived from AI predicted national production. Actual farm yield varies by variety, irrigation, and management. Cost figures are ICAR averages — adjust for local conditions.
        </p>
      </div>
    </div>
  );
}
