import { CROP_MAP } from "@/lib/cropData";
import { CropInputs } from "@/types";
import { FlaskConical, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  inputs: CropInputs;
}

interface Fertilizer {
  name: string;
  shortName: string;
  nutrient: "N" | "P" | "K";
  contentPct: number;    // % nutrient content in fertilizer
  unit: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const FERTILIZERS: Fertilizer[] = [
  {
    name: "Urea",
    shortName: "Urea",
    nutrient: "N",
    contentPct: 46,
    unit: "kg/ha",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Primary nitrogen source. Split application recommended.",
  },
  {
    name: "DAP (Di-Ammonium Phosphate)",
    shortName: "DAP",
    nutrient: "P",
    contentPct: 46,
    unit: "kg/ha",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Contains 18% N + 46% P₂O₅. Apply basal before sowing.",
  },
  {
    name: "MOP (Muriate of Potash)",
    shortName: "MOP",
    nutrient: "K",
    contentPct: 60,
    unit: "kg/ha",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "60% K₂O. Apply as basal or in split with irrigation.",
  },
];

// Secondary recommendation options
const ALT_FERTILIZERS: Record<"N" | "P" | "K", { name: string; dose: string; tip: string }[]> = {
  N: [
    { name: "Ammonium Sulphate", dose: "Adjust for 20% N content", tip: "Good for alkaline soils" },
    { name: "CAN (Calcium Ammonium Nitrate)", dose: "Apply in 2–3 splits", tip: "Reduces soil acidification" },
  ],
  P: [
    { name: "SSP (Single Super Phosphate)", dose: "Adjust for 16% P₂O₅", tip: "Also supplies Ca and S" },
    { name: "Rock Phosphate", dose: "Apply to acidic soils only", tip: "Slow-release, good for legumes" },
  ],
  K: [
    { name: "SOP (Sulphate of Potash)", dose: "Adjust for 50% K₂O", tip: "Better for chloride-sensitive crops" },
    { name: "Wood Ash", dose: "200–400 kg/ha", tip: "Organic K source, raises pH slightly" },
  ],
};

function getDelta(current: number, idealMin: number, idealMax: number): number {
  if (current < idealMin) return idealMin - current; // deficiency
  if (current > idealMax) return -(current - idealMax); // excess
  return 0;
}

function calcFertilizerDose(deficiency: number, contentPct: number): number {
  // deficiency in kg/ha of nutrient → fertilizer qty needed
  return Math.round((deficiency / (contentPct / 100)) * 10) / 10;
}

export default function FertilizerRecommendation({ inputs }: Props) {
  const profile = CROP_MAP[inputs.crop];
  if (!profile) return null;

  const deltas: Record<"N" | "P" | "K", number> = {
    N: getDelta(inputs.N, profile.idealN[0], profile.idealN[1]),
    P: getDelta(inputs.P, profile.idealP[0], profile.idealP[1]),
    K: getDelta(inputs.K, profile.idealK[0], profile.idealK[1]),
  };

  const recommendations = FERTILIZERS.map((fert) => {
    const delta = deltas[fert.nutrient];
    const fertDose = delta > 0 ? calcFertilizerDose(delta, fert.contentPct) : 0;
    const current = fert.nutrient === "N" ? inputs.N : fert.nutrient === "P" ? inputs.P : inputs.K;
    const idealMin = fert.nutrient === "N" ? profile.idealN[0] : fert.nutrient === "P" ? profile.idealP[0] : profile.idealK[0];
    const idealMax = fert.nutrient === "N" ? profile.idealN[1] : fert.nutrient === "P" ? profile.idealP[1] : profile.idealK[1];

    return { fert, delta, fertDose, current, idealMin, idealMax };
  });

  const anyDeficiency = recommendations.some((r) => r.delta > 0);
  const anyExcess = recommendations.some((r) => r.delta < 0);
  const allOptimal = !anyDeficiency && !anyExcess;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-amber-700" />
        </div>
        <h3 className="font-heading font-700 text-lg text-foreground">Fertilizer Recommendation</h3>
        <span className="text-xs text-muted-foreground ml-auto">for {profile.displayName}</span>
      </div>

      {/* Status banner */}
      {allOptimal ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-5">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">Soil nutrients are in optimal range</p>
            <p className="text-xs text-green-600">No major fertilizer additions needed. Maintain current nutrition program.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {anyDeficiency && anyExcess ? "Nutrient imbalance detected" : anyDeficiency ? "Nutrient deficiency detected" : "Nutrient excess detected"}
            </p>
            <p className="text-xs text-amber-600">Follow recommendations below before sowing season.</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map(({ fert, delta, fertDose, current, idealMin, idealMax }) => {
          const isDeficient = delta > 0;
          const isExcess = delta < 0;
          const isOptimal = delta === 0;

          return (
            <div
              key={fert.nutrient}
              className={`rounded-xl border p-4 ${
                isOptimal
                  ? "bg-green-50 border-green-200"
                  : isDeficient
                  ? `${fert.bgColor} ${fert.borderColor}`
                  : "bg-red-50 border-red-200"
              }`}
            >
              {/* Nutrient header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isOptimal ? "bg-green-600 text-white" : isDeficient ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                  }`}>
                    {fert.nutrient}
                  </div>
                  <span className="font-semibold text-sm text-foreground">{fert.shortName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isOptimal ? "bg-green-100 text-green-700" : isDeficient ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {isOptimal ? "Optimal" : isDeficient ? `Deficient −${delta} kg/ha` : `Excess +${Math.abs(delta)} kg/ha`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isDeficient ? (
                    <TrendingDown className="w-4 h-4 text-amber-500" />
                  ) : isExcess ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Current: <strong className="text-foreground">{current} kg/ha</strong></span>
                  <span>Ideal: <strong className="text-foreground">{idealMin}–{idealMax} kg/ha</strong></span>
                </div>
                <div className="relative h-2.5 bg-white rounded-full overflow-hidden border border-border">
                  {/* Ideal range highlight */}
                  <div
                    className="absolute top-0 h-full bg-green-200 opacity-50 rounded-full"
                    style={{
                      left: `${Math.min((idealMin / 160) * 100, 95)}%`,
                      width: `${Math.min(((idealMax - idealMin) / 160) * 100, 40)}%`,
                    }}
                  />
                  {/* Current value marker */}
                  <div
                    className={`absolute top-0 h-full rounded-full transition-all ${
                      isOptimal ? "bg-green-500" : isDeficient ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min((current / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Recommendation */}
              {isDeficient && (
                <div className={`rounded-lg p-3 ${fert.bgColor} border ${fert.borderColor}`}>
                  <div className="flex items-start gap-2">
                    <FlaskConical className={`w-4 h-4 mt-0.5 ${fert.color}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${fert.color}`}>
                        Apply {fert.shortName}: <span className="font-800">{fertDose} kg/ha</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fert.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Nutrient content</p>
                      <p className={`text-sm font-bold ${fert.color}`}>{fert.contentPct}%</p>
                    </div>
                  </div>
                  {/* Alternatives */}
                  <div className="mt-2 pt-2 border-t border-opacity-30 border-current">
                    <p className="text-xs text-muted-foreground mb-1.5 font-semibold">Alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {ALT_FERTILIZERS[fert.nutrient].map((alt) => (
                        <div key={alt.name} className="text-xs bg-white bg-opacity-70 rounded-lg px-2.5 py-1.5 border border-white">
                          <p className="font-semibold text-foreground">{alt.name}</p>
                          <p className="text-muted-foreground">{alt.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isExcess && (
                <div className="rounded-lg p-3 bg-red-50 border border-red-200">
                  <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Reduce {fert.nutrient} application — excess {fert.nutrient} may harm yield
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {fert.nutrient === "N"
                      ? "Excess N causes excessive vegetative growth, lodging, and delayed maturity."
                      : fert.nutrient === "P"
                      ? "Excess P reduces zinc availability and may cause micronutrient deficiencies."
                      : "Excess K inhibits Mg and Ca uptake. Reduce MOP/SOP application this season."}
                  </p>
                </div>
              )}

              {isOptimal && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No {fert.name} required — {fert.nutrient} is within ideal range
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* General notes */}
      <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-xl">
        <p className="text-xs text-brand-700 font-semibold mb-1">Application Guidelines</p>
        <ul className="text-xs text-muted-foreground space-y-0.5 leading-relaxed list-disc list-inside">
          <li>Apply P and K as basal fertilizer before sowing/transplanting</li>
          <li>Split N application: 50% basal + 25% at 30 DAS + 25% at 60 DAS</li>
          <li>Conduct soil test every 2 years to re-calibrate nutrient levels</li>
          <li>Use organic matter (FYM 10 t/ha) alongside chemical fertilizers</li>
        </ul>
      </div>
    </div>
  );
}
