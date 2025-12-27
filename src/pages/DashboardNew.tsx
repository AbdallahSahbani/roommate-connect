import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, MessageSquare, Home, Sparkles } from "lucide-react";

const VerificationRing = ({ percent }: { percent: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgb(30 41 59)"
          strokeWidth="6"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-slate-100">{percent}%</span>
      </div>
    </div>
  );
};

const MatchScoreRing = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-10 w-10">
      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="rgb(30 41 59)" strokeWidth="3" />
        <motion.circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="url(#matchGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-medium text-slate-100">{score}</span>
      </div>
    </div>
  );
};

const mockMatches = [
  { id: 1, name: "Alex", age: 27, location: "Downtown", trait: "Cat-friendly", score: 92, tags: ["Early riser", "Clean", "Quiet", "No smoking"] },
  { id: 2, name: "Jordan", age: 29, location: "Harlem", trait: "Dog-friendly", score: 88, tags: ["Night owl", "Social", "Non-smoker"] },
  { id: 3, name: "Sam", age: 25, location: "Brooklyn", trait: "Pet-free", score: 85, tags: ["WFH", "Gym", "Clean", "Quiet"] },
];

export default function DashboardNew() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 lg:grid-cols-3 auto-rows-min pb-20 lg:pb-0">
      {/* Verification status card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
      >
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-100">Verification</h2>
          <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30">
            2 / 3 complete
          </span>
        </header>
        <div className="flex items-center gap-5">
          <VerificationRing percent={67} />
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>ID Verified</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Face scan verified</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              <span>Income pending review</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate("/verification")}
          className="mt-4 w-full h-9 text-xs font-medium rounded-xl bg-gradient-to-r from-emerald-500/20 to-sky-500/10 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-colors"
        >
          Complete verification
        </button>
      </motion.section>

      {/* Top roommate matches */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="col-span-1 lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5"
      >
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-100">Top roommate matches</h2>
          <button 
            onClick={() => navigate("/roommate-swipe")}
            className="text-xs text-sky-300 hover:text-sky-200 transition-colors"
          >
            View all →
          </button>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {mockMatches.map((match, index) => (
            <motion.article
              key={match.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="group bg-slate-900/80 border border-slate-800 rounded-xl p-3 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm text-slate-300">
                    {match.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-100">{match.name}, {match.age}</p>
                    <p className="text-[11px] text-slate-400">{match.location} · {match.trait}</p>
                  </div>
                </div>
                <MatchScoreRing score={match.score} />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {match.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="mt-3 w-full h-8 text-[11px] font-medium rounded-lg bg-sky-500/90 text-slate-950 group-hover:bg-sky-400 transition-colors shadow-[0_4px_20px_rgba(56,189,248,0.3)]">
                Message
              </button>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* Quick stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="col-span-1 lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { icon: Sparkles, label: "Matches", value: "12", color: "emerald" },
          { icon: Home, label: "Saved Properties", value: "8", color: "sky" },
          { icon: MessageSquare, label: "Unread Messages", value: "3", color: "amber" },
          { icon: CheckCircle, label: "Trust Score", value: "85%", color: "teal" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          const colorMap = {
            emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
            sky: "from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/30",
            amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
            teal: "from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/30",
          };
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              className={`bg-gradient-to-br ${colorMap[stat.color as keyof typeof colorMap]} rounded-2xl p-4 border`}
            >
              <Icon className="h-5 w-5 mb-2" />
              <p className="text-2xl font-semibold text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Quick actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <button
          onClick={() => navigate("/roommate-swipe")}
          className="group flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl hover:border-emerald-400/40 transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-slate-100">AI Roommate Matching</h3>
            <p className="text-xs text-slate-400">Swipe to find your perfect roommate</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/properties")}
          className="group flex items-center gap-4 p-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/20 rounded-2xl hover:border-sky-400/40 transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-2xl bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="h-6 w-6 text-sky-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-slate-100">Browse Properties</h3>
            <p className="text-xs text-slate-400">Find AI-matched listings for your group</p>
          </div>
        </button>
      </motion.section>
    </div>
  );
}
