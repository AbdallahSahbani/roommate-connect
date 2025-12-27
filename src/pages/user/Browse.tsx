import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Heart, MessageSquare } from "lucide-react";

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
          stroke="url(#browseGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="browseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

const mockRoommates = [
  { id: 1, name: "Jordan", age: 29, moveIn: "Feb", location: "Harlem", score: 88, tags: ["Night owl", "Social", "Dog-friendly", "Non-smoker"] },
  { id: 2, name: "Casey", age: 26, moveIn: "Mar", location: "Brooklyn", score: 85, tags: ["Early riser", "Quiet", "Cat-friendly", "WFH"] },
  { id: 3, name: "Morgan", age: 31, moveIn: "Feb", location: "Queens", score: 82, tags: ["Social", "Gym", "Clean", "Pet-free"] },
];

const compatibilityBreakdown = [
  { label: "Budget", status: "Excellent overlap", color: "emerald" },
  { label: "Move-in dates", status: "Good", color: "sky" },
  { label: "Lifestyle", status: "Medium · different sleep pattern", color: "amber" },
  { label: "Social", status: "Strong match", color: "emerald" },
  { label: "Pets/smoking", status: "Perfect", color: "emerald" },
];

export default function BrowseNew() {
  const [budget, setBudget] = useState([800, 1600]);
  const [selectedMatch, setSelectedMatch] = useState(mockRoommates[0]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,minmax(0,1.4fr),minmax(0,1fr)] pb-20 lg:pb-0">
      {/* Filters sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-5 h-fit"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-100">Filters</h2>
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, location..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>

        {/* Budget slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Budget</p>
            <p className="text-xs text-slate-200">${budget[0]} - ${budget[1]}</p>
          </div>
          <div className="relative h-2 rounded-full bg-slate-800">
            <div 
              className="absolute h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
              style={{ left: `${(budget[0] - 500) / 20}%`, right: `${100 - (budget[1] - 500) / 20}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>$500</span>
            <span>$2,500</span>
          </div>
        </div>

        {/* Lifestyle chips */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Lifestyle</p>
          <div className="flex flex-wrap gap-2">
            {["Early riser", "Night owl", "WFH", "Social", "Quiet"].map((tag) => (
              <button
                key={tag}
                className="text-[11px] px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:border-sky-500/50 hover:text-sky-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            { label: "Pet-friendly", active: true },
            { label: "Non-smoker only", active: false },
            { label: "Verified only", active: true },
          ].map((toggle) => (
            <div key={toggle.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-300">{toggle.label}</span>
              <button
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  toggle.active ? "bg-emerald-500/30" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                    toggle.active ? "left-4 bg-emerald-400" : "left-0.5 bg-slate-400"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Match cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-100">Roommate matches</h2>
            <p className="text-xs text-slate-400">Sorted by compatibility</p>
          </div>
          <span className="text-xs text-slate-500">{mockRoommates.length} matches</span>
        </header>

        <div className="space-y-3">
          {mockRoommates.map((match, index) => (
            <motion.article
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => setSelectedMatch(match)}
              className={`bg-slate-900/60 border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                selectedMatch?.id === match.id
                  ? "border-sky-500/50 shadow-[0_0_30px_rgba(56,189,248,0.1)]"
                  : "border-slate-800 hover:border-sky-500/30"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm text-slate-300">
                    {match.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{match.name}, {match.age}</p>
                    <p className="text-xs text-slate-400">Move-in: {match.moveIn} · {match.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MatchScoreRing score={match.score} />
                  <span className="text-[11px] text-slate-400">High compatibility</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {match.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="h-8 px-4 rounded-lg bg-sky-500 text-slate-950 text-xs font-medium hover:bg-sky-400 transition-colors shadow-[0_4px_20px_rgba(56,189,248,0.3)]">
                  <MessageSquare className="h-3.5 w-3.5 inline mr-1.5" />
                  Message
                </button>
                <button className="h-8 px-3 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-slate-500 transition-colors">
                  <Heart className="h-3.5 w-3.5 inline mr-1.5" />
                  Save
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* Compatibility side panel */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4 h-fit"
      >
        <h2 className="text-sm font-medium text-slate-100">Compatibility breakdown</h2>
        
        {selectedMatch && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm text-slate-300">
              {selectedMatch.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">{selectedMatch.name}</p>
              <p className="text-xs text-emerald-400">{selectedMatch.score}% match</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {compatibilityBreakdown.map((item) => {
            const colorMap = {
              emerald: "bg-emerald-500/20 text-emerald-300",
              sky: "bg-sky-500/20 text-sky-300",
              amber: "bg-amber-500/20 text-amber-300",
            };
            return (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${colorMap[item.color as keyof typeof colorMap]}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>

        <button className="w-full h-10 mt-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-sky-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/30 hover:border-emerald-400/50 transition-colors">
          View full profile
        </button>
      </motion.aside>
    </div>
  );
}
