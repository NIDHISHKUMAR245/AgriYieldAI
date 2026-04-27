import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import AIAssistant from "@/components/features/AIAssistant";
import Home from "@/pages/Home";
import Predictor from "@/pages/Predictor";
import CropInsights from "@/pages/CropInsights";
import Compare from "@/pages/Compare";
import SeasonalCalendar from "@/pages/SeasonalCalendar";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predictor />} />
          <Route path="/insights" element={<CropInsights />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/calendar" element={<SeasonalCalendar />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Global AI Assistant (visible on all pages except auth) */}
        <AIAssistant />
      </AuthProvider>
    </BrowserRouter>
  );
}
