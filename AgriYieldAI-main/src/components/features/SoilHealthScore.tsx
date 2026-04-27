import { CROP_MAP } from "@/lib/cropData";
import { CropInputs } from "@/types";
import { ShieldCheck, Leaf, Droplets, Zap } from "lucide-react";

interface Props {
  inputs: CropInputs;
}

function paramScore(val: number, range: [number, number]): number {
  const mid = (range[0] + range[1]) / 2;
  const halfWidth = (range[1] - range[0]) / 2 || 1;
  const dist = Math.abs(val - mid) / halfWidth;
  return Math.max(0, Math.min(100, 100 - dist * 40));
}

interface SubScore {
  label: string;
  icon: React.ElementType;
  score: number;
  color: string;
  desc: string;
}

export default function SoilHealthScore({ inputs }: Props) {
  const profile = CROP_MAP[inputs.crop];
  if (!profile) return null;

  const nScore = paramScore(inputs.N, profile.idealN);
  const pScore = paramScore(inputs.P, profile.idealP);
  const kScore = paramScore(inputs.K, profile.idealK);
  const phScore = paramScore(inputs.ph, profile.idealPh);

  const overallScore = Math.round((nScore * 0.3 + pScore * 0.25 + kScore * 0.25 + phScore * 0.2));

  const getGrade = (s: number) => {
    if (s >= 85) return { label: "Excellent", color: "text-brand-700", ring: "ring-brand-400", bg: "bg-brand-600" };
    if (s >= 70) return { label: "Good", color: "text-blue-700", ring: "ring-blue-400", bg: "bg-blue-500" };
    if (s >= 50) return { label: "Fair", color: "text-amber-700", ring: "ring-amber-400", bg: "bg-amber-500" };
    return { label: "Poor", color: "text-red-700", ring: "ring-red-400", bg: "bg-red-500" };
  };

  const grade = getGrade(overallScore);

  const subScores: SubScore[] = [
    {
      label: "Nitrogen (N)",
      icon: Leaf,
      score: Math.round(nScore),
      color: nScore >= 70 ? "bg-brand-500" : nScore >= 50 ? "bg-amber-500" : "bg-red-400",
      desc: `${inputs.N} kg/ha — Ideal: ${profile.idealN[0]}–${profile.idealN[1]}`,
    },
    {
      label: "Phosphorus (P)",
      icon: Zap,
      score: Math.round(pScore),
      color: pScore >= 70 ? "bg-brand-500" : pScore >= 50 ? "bg-amber-500" : "bg-red-400",
      desc: `${inputs.P} kg/ha — Ideal: ${profile.idealP[0]}–${profile.idealP[1]}`,
    },
    {
      label: "Potassium (K)",
      icon: Droplets,
      score: Math.round(kScore),
      color: kScore >= 70 ? "bg-brand-500" : kScore >= 50 ? "bg-amber-500" : "bg-red-400",
      desc: `${inputs.K} kg/ha — Ideal: ${profile.idealK[0]}–${profile.idealK[1]}`,
    },
    {
      label: "Soil pH",
      icon: ShieldCheck,
      score: Math.round(phScore),
      color: phScore >= 70 ? "bg-brand-500" : phScore >= 50 ? "bg-amber-500" : "bg-red-400",
      desc: `pH ${inputs.ph} — Ideal: ${profile.idealPh[0]}–${profile.idealPh[1]}`,
    },
  ];

  // Circular progress arc
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
        </div>
        <h3 className="font-heading font-700 text-lg text-foreground">Soil Health Score</h3>
        <span className="text-xs text-muted-foreground ml-auto">for {profile.displayName}</span>
      </div>

      {/* Score Gauge */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            {/* Background ring */}
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#f0fdf4" strokeWidth="12" />
            {/* Score arc */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={overallScore >= 85 ? "#16a34a" : overallScore >= 70 ? "#3b82f6" : overallScore >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <span className={`font-heading font-800 text-3xl ${grade.color}`}>{overallScore}</span>
            <span className="text-xs text-muted-foreground font-medium">/ 100</span>
          </div>
        </div>

        <div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mb-2 ${grade.color} bg-opacity-10`}
            style={{ backgroundColor: overallScore >= 85 ? "#f0fdf4" : overallScore >= 70 ? "#eff6ff" : overallScore >= 50 ? "#fffbeb" : "#fef2f2" }}>
            <div className={`w-2 h-2 rounded-full ${grade.bg}`} />
            {grade.label} Soil
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on N, P, K, and pH values relative to ideal ranges for <strong>{profile.displayName}</strong>.
          </p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-3">
        {subScores.map(({ label, icon: Icon, score, color, desc }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{desc}</span>
                <span className="text-xs font-bold text-foreground w-7 text-right">{score}</span>
              </div>
            </div>
            <div className="h-1.5 bg-brand-50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
        Weights: N (30%) · P (25%) · K (25%) · pH (20%) — aligned with crop-specific ideal ranges
      </p>
    </div>
  );
}
