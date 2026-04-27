import { Link } from "react-router-dom";
import { ArrowRight, Database, Cpu, TrendingUp, CheckCircle, Leaf, Globe, MessageCircle, Bot, Shield, Zap } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import { CROP_PROFILES, MODEL_METRICS, DATASET_STATS } from "@/lib/cropData";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: Database,
    title: "FAOSTAT-Trained Data",
    desc: "31,037 cleaned records from India's FAOSTAT production data merged with crop recommendation dataset",
    color: "bg-brand-100 text-brand-700",
  },
  {
    icon: Cpu,
    title: "XGBoost Model",
    desc: "Hyperparameter-tuned XGBoost regressor for production yield estimation",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: TrendingUp,
    title: "15 Indian Crops",
    desc: "Covers major crops: banana, maize, rice, cotton, mango, jute, and 9 more with crop-specific insights",
    color: "bg-earth-100 text-earth-700",
  },
  {
    icon: Bot,
    title: "AI Agri Assistant",
    desc: "Powered by Gemini 3 Flash — ask anything about soil health, crop rotation, fertilizers, and more",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Zap,
    title: "Live Weather",
    desc: "Auto-fill temperature, humidity, and rainfall from Open-Meteo using your city or GPS location",
    color: "bg-sky-100 text-sky-700",
  },
  {
    icon: Shield,
    title: "Complete Agronomics",
    desc: "Soil health score, fertilizer doses, pest alerts, crop rotation advisor, profit estimator — all in one",
    color: "bg-purple-100 text-purple-700",
  },
];

const steps = [
  { step: "01", title: "Select Your Crop", desc: "Choose from 15 major Indian crops in our database" },
  { step: "02", title: "Enter Soil & Climate Data", desc: "Input N, P, K levels, temperature, humidity, pH, and rainfall" },
  { step: "03", title: "Get AI Prediction", desc: "Our XGBoost model predicts production yield in seconds" },
  { step: "04", title: "Act on Insights", desc: "Review personalized recommendations to maximize your yield" },
];

export default function Home() {
  const bestModel = MODEL_METRICS[MODEL_METRICS.length - 1];
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroFarm} alt="Indian agricultural fields" className="w-full h-full object-cover" />
          <div className="gradient-hero absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-800 text-white leading-[1.1] mb-6 animate-slide-up">
              Predict Crop Yield
              <span className="block text-gradient mt-1">with AI Precision</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl animate-fade-in">
              Enter your soil nutrients and climate conditions. Our XGBoost model — trained on 31,037 rows of Indian agricultural data — predicts production yield for 15 major crops.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in">
              <Link
                to="/predict"
                className="flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-heading font-700 text-lg rounded-2xl hover:bg-brand-400 transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95"
              >
                Start Predicting
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!user ? (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-heading font-600 text-lg rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  Create Account
                </Link>
              ) : (
                <Link
                  to="/insights"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-heading font-600 text-lg rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  Model Performance
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Auth CTA Section — only shown when not logged in */}
      {!user && (
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-brand-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="font-heading text-3xl font-700 text-white mb-3">
                  Join AgriYield AI Today
                </h2>
                <p className="text-emerald-100 text-base leading-relaxed">
                  Create a free account to unlock the full AI assistant, save your predictions, and get personalized crop advice powered by Gemini 3 Flash.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  to="/auth?mode=register"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all duration-200 shadow-lg active:scale-95 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Create Free Account
                </Link>
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all duration-200 text-sm"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-700 text-foreground mb-4">
              Built on Real Agricultural Science
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Combining FAOSTAT production statistics with crop recommendation data, live weather, and AI assistance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gradient-card p-7 rounded-2xl border border-brand-100 hover:shadow-lg transition-shadow duration-300">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-700 text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Highlight */}
      <section className="py-20 bg-gradient-to-br from-brand-950 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-sm font-medium mb-6">
                <Bot className="w-4 h-4" />
                Powered by Gemini 3 Flash
              </div>
              <h2 className="font-heading text-4xl font-700 text-white mb-5 leading-tight">
                Your Personal Agri Expert,<br />Available 24/7
              </h2>
              <p className="text-brand-300 text-lg leading-relaxed mb-8">
                Ask anything — from fertilizer doses to pest control, from soil pH correction to crop rotation strategies. The AI assistant knows Indian farming conditions inside out.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Fertilizer quantities & application timing",
                  "Pest and disease identification & control",
                  "Crop rotation for soil health",
                  "Government schemes (PM-KISAN, Soil Health Card)",
                  "Kharif, Rabi & Zaid seasonal advice",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-brand-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-300 text-xs font-medium">Live on all pages</span>
                </div>
                <span className="text-brand-400 text-xs">Click the chat bubble at bottom-right →</span>
              </div>
            </div>

            {/* Right: mock chat preview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AgriYield Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-300 text-xs">Online</span>
                  </div>
                </div>
              </div>
              {[
                { role: "user", text: "What NPK ratio should I use for banana?" },
                { role: "bot", text: "For banana in India, use an NPK ratio of 200:30:200 g per plant per year, split into 4 doses. Apply in ring-basin method. Potassium is critical for bunch weight." },
                { role: "user", text: "Which fertilizer is best for potassium?" },
                { role: "bot", text: "MOP (Muriate of Potash) at 60% K₂O is most economical. For chloride-sensitive varieties, use SOP (Sulphate of Potash). Apply before irrigation for best uptake." },
              ].map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "bot" ? "bg-brand-600/40" : "bg-emerald-600"}`}>
                    {msg.role === "bot" ? <Leaf className="w-3.5 h-3.5 text-brand-200" /> : <span className="text-xs text-white font-bold">U</span>}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-brand-600 text-white rounded-tr-sm" : "bg-white/10 text-white/90 rounded-tl-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 flex items-center">
                  <span className="text-white/40 text-sm">Ask about your crop...</span>
                </div>
                <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-brand-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-700 text-white mb-4">How It Works</h2>
            <p className="text-brand-300 text-lg">Four simple steps to your yield prediction</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-brand-700 z-0" style={{ width: "calc(100% - 2rem)" }} />
                )}
                <div className="bg-brand-900 rounded-2xl p-6 border border-brand-800 relative z-10">
                  <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="font-heading font-800 text-sm text-white">{s.step}</span>
                  </div>
                  <h3 className="font-heading font-700 text-white mb-2">{s.title}</h3>
                  <p className="text-brand-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crops grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl font-700 text-foreground mb-4">15 Supported Crops</h2>
            <p className="text-muted-foreground text-lg">Covering major kharif, rabi, and horticultural crops of India</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-3">
            {CROP_PROFILES.map((crop) => (
              <Link
                key={crop.name}
                to="/predict"
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border hover:border-brand-300 hover:shadow-md transition-all duration-200"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{crop.emoji}</span>
                <span className="text-xs font-semibold text-foreground text-center">{crop.displayName}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 py-8 text-center">
        <p className="text-brand-400 text-sm">
          AgriYield AI · <span className="text-brand-500">15 Crops · 31,037 Records</span>
        </p>
      </footer>
    </div>
  );
}
