import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Shield } from "lucide-react";

type Mode = "login" | "register" | "otp";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- LOGIN ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        toast.success("Welcome back! 🌱");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      setLoading(false);
    }
  }

  // --- REGISTER: Step 1 — send OTP ---
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      toast.success("OTP sent to your email!");
      setMode("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // --- REGISTER: Step 2 — verify OTP + set password ---
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;

      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { username: username || email.split("@")[0] },
      });
      if (updateError) throw updateError;

      toast.success("Account created! Welcome to AgriYield AI 🌾");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="bg-gradient-to-r from-brand-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-800 text-white text-xl leading-none">AgriYield AI</h1>
                <p className="text-brand-100 text-sm mt-0.5">
                  {mode === "login"
                    ? "Sign in to your account"
                    : mode === "register"
                    ? "Create your account"
                    : "Verify your email"}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {/* Login form */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full pl-10 pr-12 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-md disabled:opacity-70 active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* Register form */}
            {mode === "register" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-12 py-3 border-2 border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-md disabled:opacity-70 active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* OTP Verify form */}
            {mode === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We sent a 4-digit code to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 text-center">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-border rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-md disabled:opacity-70 active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                >
                  ← Back to registration
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-brand-400 text-xs mt-6">
          AgriYield AI · Powered by XGBoost & FAOSTAT India Data
        </p>
      </div>
    </div>
  );
}
