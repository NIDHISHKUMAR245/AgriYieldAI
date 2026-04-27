import { useState, useRef } from "react";
import PredictionForm from "@/components/features/PredictionForm";
import PredictionResult from "@/components/features/PredictionResult";
import SoilHealthScore from "@/components/features/SoilHealthScore";
import FertilizerRecommendation from "@/components/features/FertilizerRecommendation";
import PestDiseaseAlert from "@/components/features/PestDiseaseAlert";
import CropRotationAdvisor from "@/components/features/CropRotationAdvisor";
import WeatherSearch from "@/components/features/WeatherSearch";
import { PredictionResult as PR, CropInputs } from "@/types";
import { Cpu, Database, BarChart2, CloudSun } from "lucide-react";

const defaultInputs: CropInputs = {
  crop: "maize",
  N: 90, P: 45, K: 35,
  temperature: 25, humidity: 70, ph: 6.5, rainfall: 100,
};

export default function Predictor() {
  const [result, setResult] = useState<PR | null>(null);
  const [lastInputs, setLastInputs] = useState<CropInputs>(defaultInputs);
  const weatherApplyRef = useRef<((d: { temperature: number; humidity: number; rainfall: number }) => void) | null>(null);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page header */}
      <div className="bg-brand-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl font-700 text-white mb-2">Crop Yield Predictor</h1>
          <p className="text-brand-300 text-lg max-w-xl">
            Enter your soil and climate conditions to predict production yield for your chosen crop.
          </p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: Database, text: "31,037 Training Records" },
              { icon: BarChart2, text: "15 Indian Crops" },
              { icon: Cpu, text: "7 Input Features" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-1.5 bg-brand-900 border border-brand-800 rounded-lg">
                <Icon className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-brand-300 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="space-y-6">
            {/* Weather auto-fill */}
            <div>
              <h2 className="font-heading font-700 text-xl text-foreground mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CloudSun className="w-4 h-4 text-blue-600" />
                </span>
                Auto-fill from Weather
              </h2>
              <WeatherSearch
                onWeatherApply={(d) => {
                  if (weatherApplyRef.current) weatherApplyRef.current(d);
                }}
              />
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 lg:p-8">
              <h2 className="font-heading font-700 text-xl text-foreground mb-6 flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                  <span className="text-brand-700 text-xs font-bold">1</span>
                </span>
                Enter Parameters
              </h2>
              <PredictionForm
                onResult={(r, inputs) => { setResult(r); setLastInputs(inputs); }}
                onWeatherApplyRef={(fn) => { weatherApplyRef.current = fn; }}
              />
            </div>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-700 text-xl text-foreground mb-6 flex items-center gap-2">
                    <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                      <span className="text-brand-700 text-xs font-bold">2</span>
                    </span>
                    Prediction Result
                  </h2>
                  <PredictionResult result={result} inputs={lastInputs} onReset={() => setResult(null)} />
                </div>
                <SoilHealthScore inputs={lastInputs} />
                <FertilizerRecommendation inputs={lastInputs} />
                <PestDiseaseAlert inputs={lastInputs} />
                <CropRotationAdvisor inputs={lastInputs} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">🌾</span>
                </div>
                <h3 className="font-heading font-700 text-xl text-foreground mb-2">Ready to Predict</h3>
                <p className="text-muted-foreground max-w-xs leading-relaxed">
                  Fill in the parameters on the left and click <strong>Predict Crop Yield</strong> to get your AI-powered production estimate.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 text-left max-w-xs w-full">
                  {[
                    { param: "N, P, K", desc: "Soil nutrients" },
                    { param: "Temperature", desc: "Growing season avg" },
                    { param: "Humidity", desc: "Relative humidity" },
                    { param: "Rainfall", desc: "Seasonal rainfall" },
                    { param: "Soil pH", desc: "Acidity level" },
                    { param: "Crop Type", desc: "15 supported crops" },
                  ].map((p) => (
                    <div key={p.param} className="bg-brand-50 rounded-xl p-3">
                      <p className="text-brand-700 font-semibold text-sm">{p.param}</p>
                      <p className="text-muted-foreground text-xs">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
