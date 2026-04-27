import { PredictionResult as PR } from "@/types";
import { CropInputs } from "@/types";
import { TrendingUp, AlertCircle, CheckCircle2, Info, Award, Target, Cpu, Download } from "lucide-react";
import { toast } from "sonner";
import ProfitEstimator from "@/components/features/ProfitEstimator";

interface Props {
  result: PR;
  inputs: CropInputs;
  onReset: () => void;
}

const categoryConfig = {
  Excellent: { color: "text-brand-700", bg: "bg-brand-50", border: "border-brand-200", icon: Award },
  High: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: TrendingUp },
  Medium: { color: "text-earth-700", bg: "bg-earth-50", border: "border-earth-200", icon: Target },
  Low: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle },
};

function formatYield(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

function formatNum(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

function generatePDFContent(result: PR, inputs: CropInputs): string {
  const now = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
  const params = [
    `Crop: ${result.crop}`,
    `Nitrogen (N): ${inputs.N} kg/ha`,
    `Phosphorus (P): ${inputs.P} kg/ha`,
    `Potassium (K): ${inputs.K} kg/ha`,
    `Temperature: ${inputs.temperature} °C`,
    `Humidity: ${inputs.humidity} %`,
    `Soil pH: ${inputs.ph}`,
    `Rainfall: ${inputs.rainfall} mm`,
  ];
  return `
========================================
    AGRIYIELD AI — CROP YIELD REPORT
========================================
Generated : ${now}
Model     : XGBoost (Scaled) — R² ${result.r2Score}%
Dataset   : FAOSTAT India · 31,037 rows

--- PREDICTED RESULT ---
Crop            : ${result.crop}
Predicted Yield : ${formatNum(result.predictedYield)} tonnes
Yield Category  : ${result.yieldCategory}
Model Confidence: ${result.confidence}%

--- INPUT PARAMETERS ---
${params.join("\n")}

--- RECOMMENDATION ---
${result.recommendation}

--- PARAMETER INSIGHTS ---
${result.insights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")}

========================================
AgriYield AI · agriyield.onspace.app
Trainee Model by Nidhish
========================================
  `.trim();
}

export default function PredictionResult({ result, inputs, onReset }: Props) {
  const cfg = categoryConfig[result.yieldCategory];

  function handleDownload() {
    const content = generatePDFContent(result, inputs);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgriYield_${result.crop.replace(/\s+/g, "_")}_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  }
  const CatIcon = cfg.icon;

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Main result card */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Predicted Production Yield</p>
            <h2 className="font-heading text-4xl font-800 text-foreground">
              {formatYield(result.predictedYield)}
              <span className="text-xl font-500 text-muted-foreground ml-2">{result.unit}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">for {result.crop} in India</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg} border ${cfg.border}`}>
            <CatIcon className={`w-4 h-4 ${cfg.color}`} />
            <span className={`text-sm font-semibold ${cfg.color}`}>{result.yieldCategory}</span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs text-muted-foreground font-medium">Model Confidence</span>
            </div>
            <p className="text-2xl font-heading font-700 text-brand-700">{result.confidence}%</p>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs text-muted-foreground font-medium">R² Accuracy</span>
            </div>
            <p className="text-2xl font-heading font-700 text-brand-700">{result.r2Score}%</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="font-heading font-600 text-foreground mb-1">Recommendation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-earth-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-earth-600" />
          </div>
          <h3 className="font-heading font-600 text-foreground">Parameter Insights</h3>
        </div>
        <div className="space-y-2">
          {result.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-soil-100 rounded-xl">
              <span className="text-brand-600 mt-0.5 flex-shrink-0">
                {insight.startsWith("All") ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Model info */}
      <div className="bg-brand-950 rounded-2xl p-4 text-center">
        <p className="text-brand-300 text-xs">
          Prediction powered by <span className="text-brand-200 font-semibold">XGBoost (Scaled)</span> model
          trained on <span className="text-brand-200 font-semibold">31,037 rows</span> of FAOSTAT India data
        </p>
      </div>

      {/* Profit Estimator */}
      <ProfitEstimator result={result} />

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        <Download className="w-4 h-4" />
        Download Report
      </button>

      <button
        onClick={onReset}
        className="w-full py-3 border-2 border-brand-200 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all duration-200 active:scale-95"
      >
        New Prediction
      </button>
    </div>
  );
}
