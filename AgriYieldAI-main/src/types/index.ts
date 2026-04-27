export interface CropInputs {
  crop: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface PredictionResult {
  crop: string;
  predictedYield: number;
  unit: string;
  confidence: number;
  r2Score: number;
  recommendation: string;
  yieldCategory: "Low" | "Medium" | "High" | "Excellent";
  insights: string[];
}

export interface CropProfile {
  name: string;
  displayName: string;
  emoji: string;
  color: string;
  bgColor: string;
  baseYield: number;
  yieldUnit: string;
  idealN: [number, number];
  idealP: [number, number];
  idealK: [number, number];
  idealTemp: [number, number];
  idealHumidity: [number, number];
  idealPh: [number, number];
  idealRainfall: [number, number];
  description: string;
}

export interface ModelMetric {
  name: string;
  trainR2: number;
  testR2: number;
  trainRMSE: number;
  testRMSE: number;
  trainMAE: number;
  testMAE: number;
}
