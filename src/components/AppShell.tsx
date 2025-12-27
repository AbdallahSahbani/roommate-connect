import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutGrid, 
  Sparkles, 
  Home, 
  MessageSquare, 
  Shield, 
  Settings,
  LogOut,
  Users
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/roommate-swipe", label: "Matches", icon: Sparkles },
  { to: "/properties", label: "Properties", icon: Home },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/verification", label: "Verification", icon: Shield },
];

export function AppShell() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl fixed h-full z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 shadow-[0_0_20px_rgba(52,211,153,0.4)]" />
          <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            LiveBigger
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-sm text-slate-300">U</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">Plan</p>
                <p className="text-sm font-medium text-slate-200">Free · Verified</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/subscription")}
              className="flex-1 h-8 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-slate-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="lg:hidden h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500" />
            <h1 className="text-base lg:text-lg font-semibold tracking-tight text-slate-100">
              Your home, perfectly matched
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI matching live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-full bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-xs text-sky-300 border border-sky-500/30 hover:border-sky-400/50 transition-colors">
              3-day trial · 2 days left
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-500",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default AppShell;
