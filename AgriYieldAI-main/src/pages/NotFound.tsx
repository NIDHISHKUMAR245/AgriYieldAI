import { Link } from "react-router-dom";
import { Home, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20">
      <div className="text-center max-w-md px-4">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🌾</span>
        </div>
        <h1 className="font-heading text-6xl font-800 text-brand-700 mb-2">404</h1>
        <h2 className="font-heading text-2xl font-700 text-foreground mb-3">Field Not Found</h2>
        <p className="text-muted-foreground mb-8">This page doesn't exist. Head back to the predictor.</p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-brand-50 transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            to="/predict"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Sprout className="w-4 h-4" /> Predict Yield
          </Link>
        </div>
      </div>
    </div>
  );
}
