import { useState } from "react";
import { MODEL_METRICS, DATASET_STATS, CROP_PROFILES, CROP_MAP } from "@/lib/cropData";
import { HISTORICAL_PRODUCTION } from "@/lib/historicalData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from "recharts";
import { Database, GitBranch, Layers, Target, TrendingUp, CheckCircle2, Activity } from "lucide-react";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function formatTrend(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

const COLORS = ["#22c55e", "#16a34a", "#15803d", "#0f6b30", "#052e16"];

const correlationData = [
  { feature: "N", withYield: 0.053 },
  { feature: "P", withYield: 0.19 },
  { feature: "K", withYield: -0.056 },
  { feature: "Temp", withYield: 0.0049 },
  { feature: "Humidity", withYield: -0.069 },
  { feature: "pH", withYield: -0.27 },
  { feature: "Rainfall", withYield: 0.013 },
];

export default function CropInsights() {
  const [trendCrops, setTrendCrops] = useState<string[]>(["maize", "banana", "mango"]);
  const r2Data = MODEL_METRICS.map((m) => ({
    name: m.name.replace(" (Scaled) ✓", " ✓").replace("XGBoost", "XGB"),
    Train: m.trainR2,
    Test: m.testR2,
  }));

  const rmseData = MODEL_METRICS.map((m) => ({
    name: m.name.replace(" (Scaled) ✓", " ✓").replace("XGBoost", "XGB"),
    Train: m.trainRMSE,
    Test: m.testRMSE,
  }));

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="bg-brand-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-brand-400 text-sm font-medium">Model Performance Dashboard</span>
          </div>
          <h1 className="font-heading text-4xl font-700 text-white mb-2">Model Insights & Analytics</h1>
          <p className="text-brand-300 text-lg max-w-xl">
            Training results, feature correlations, and dataset statistics from your ML pipeline.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Historical Trends */}
        <section>
          <h2 className="font-heading font-700 text-2xl text-foreground mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            FAOSTAT India — Historical Production Trends
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Year-wise production data (2010–2023) from the FAOSTAT India dataset used in model training.
          </p>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            {/* Crop selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CROP_PROFILES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setTrendCrops((prev) =>
                    prev.includes(c.name)
                      ? prev.length > 1 ? prev.filter((x) => x !== c.name) : prev
                      : prev.length < 3 ? [...prev, c.name] : prev
                  )}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    trendCrops.includes(c.name)
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.displayName}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Select up to 3 crops to compare trends. Click selected crop to deselect.</p>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2010, 2023]}
                  tickCount={8}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <YAxis
                  tickFormatter={formatTrend}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  width={55}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [formatNum(v) + " tonnes", name]}
                  labelFormatter={(l) => `Year: ${l}`}
                />
                <Legend />
                {trendCrops.map((crop, i) => {
                  const profile = CROP_MAP[crop];
                  const data = HISTORICAL_PRODUCTION[crop] || [];
                  const lineColors = ["#16a34a", "#3b82f6", "#f59e0b"];
                  return (
                    <Line
                      key={crop}
                      data={data}
                      type="monotone"
                      dataKey="value"
                      name={profile?.displayName || crop}
                      stroke={lineColors[i % lineColors.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: lineColors[i % lineColors.length] }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>

            {/* Trend stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {trendCrops.map((crop) => {
                const profile = CROP_MAP[crop];
                const data = HISTORICAL_PRODUCTION[crop] || [];
                if (!data.length) return null;
                const first = data[0].value;
                const last = data[data.length - 1].value;
                const pct = (((last - first) / first) * 100).toFixed(1);
                const growing = last >= first;
                return (
                  <div key={crop} className="bg-brand-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-lg">{profile?.emoji}</span>
                      <span className="text-xs font-semibold text-foreground">{profile?.displayName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{data[0].year}→{data[data.length-1].year}</p>
                    <p className={`font-heading font-700 text-sm mt-0.5 ${growing ? "text-brand-700" : "text-red-600"}`}>
                      {growing ? "+" : ""}{pct}% growth
                    </p>
                    <p className="text-xs text-muted-foreground">{formatNum(last)} tonnes (2023)</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* R² Chart */}
        <section>
          <h2 className="font-heading font-700 text-2xl text-foreground mb-6">R² Accuracy Comparison</h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={r2Data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[80, 87]} tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)}%`]} />
                <Bar dataKey="Train" name="Train R²" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Test" name="Test R²" radius={[4, 4, 0, 0]}>
                  {r2Data.map((_, i) => (
                    <Cell key={i} fill={COLORS[Math.min(i, COLORS.length - 1)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-2">Train R² (light) vs Test R² (dark) — higher is better</p>
          </div>
        </section>

        {/* Feature Correlations */}
        <section>
          <h2 className="font-heading font-700 text-2xl text-foreground mb-2">Feature Correlation with Yield</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Pearson correlation between each input feature and the production Value (from your heatmap). pH has strongest negative correlation (−0.27).
          </p>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={correlationData} layout="vertical" margin={{ left: 20, right: 40, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" horizontal={false} />
                <XAxis type="number" domain={[-0.35, 0.25]} tick={{ fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 12, fontWeight: 600 }} width={60} />
                <Tooltip formatter={(v: number) => [v.toFixed(4), "Correlation"]} />
                <Bar dataKey="withYield" name="Correlation" radius={[0, 4, 4, 0]}>
                  {correlationData.map((d, i) => (
                    <Cell key={i} fill={d.withYield >= 0 ? "#16a34a" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Green = positive correlation, Red = negative correlation with production yield
            </p>
          </div>
        </section>

        {/* Crop Base Yields */}
        <section>
          <h2 className="font-heading font-700 text-2xl text-foreground mb-6">Crop Production Reference (India)</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CROP_PROFILES.map((crop) => (
              <div key={crop.name} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{crop.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground">{crop.displayName}</p>
                    <p className="text-xs text-muted-foreground">{crop.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "N range", val: `${crop.idealN[0]}–${crop.idealN[1]}` },
                    { label: "pH range", val: `${crop.idealPh[0]}–${crop.idealPh[1]}` },
                    { label: "Temp °C", val: `${crop.idealTemp[0]}–${crop.idealTemp[1]}` },
                  ].map((p) => (
                    <div key={p.label} className="bg-brand-50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">{p.label}</p>
                      <p className="text-xs font-bold text-brand-700 mt-0.5">{p.val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Base Production</p>
                  <p className="font-heading font-700 text-lg text-brand-700">{formatNum(crop.baseYield)} tonnes</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="bg-brand-950 py-8 text-center mt-10">
        <p className="text-brand-400 text-sm">AgriYield AI · FAOSTAT India Data</p>
      </footer>
    </div>
  );
}
