import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Leaf, BarChart2, Home, Sprout, GitCompare, Calendar, LogIn, LogOut, User, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/predict", label: "Predictor", icon: Sprout },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/insights", label: "Insights", icon: BarChart2 },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
    setOpen(false);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-800 text-brand-800 text-lg leading-none">AgriYield</span>
              <span className="font-heading font-600 text-brand-500 text-lg leading-none"> AI</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === to
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-brand-800 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-xl">
                  <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-brand-700 max-w-[100px] truncate">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-brand-700 hover:bg-brand-50 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-brand-100 bg-white/95 backdrop-blur-sm px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === to
                  ? "bg-brand-600 text-white"
                  : "text-brand-800 hover:bg-brand-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {user && (
            <div className="pt-2 border-t border-brand-100 space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 rounded-xl">
                <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
