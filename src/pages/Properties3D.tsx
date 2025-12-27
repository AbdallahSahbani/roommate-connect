import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Filter, Grid, List } from "lucide-react";

type Property = {
  id: number;
  title: string;
  price: string;
  beds: number;
  baths: number;
  area: number;
  neighborhood: string;
  image: string;
  isAiPick?: boolean;
};

const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Sunlit Loft with Exposed Brick",
    price: "$3,150/mo",
    beds: 1,
    baths: 1,
    area: 720,
    neighborhood: "Williamsburg",
    image: "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg",
    isAiPick: true,
  },
  {
    id: 2,
    title: "Modern 2BR Near Park",
    price: "$2,850/mo",
    beds: 2,
    baths: 1,
    area: 840,
    neighborhood: "Brooklyn Heights",
    image: "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg",
  },
  {
    id: 3,
    title: "Room in 3BR with City View",
    price: "$1,650/mo",
    beds: 1,
    baths: 1,
    area: 0,
    neighborhood: "Astoria",
    image: "https://images.pexels.com/photos/4392270/pexels-photo-4392270.jpeg",
    isAiPick: true,
  },
];

export default function Properties3D() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState(3200);

  return (
    <div className="relative min-h-screen pb-20 lg:pb-0">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-[-10%] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
        <div className="absolute inset-[-15%] bg-[radial-gradient(circle_at_bottom,_rgba(34,197,94,0.1),_transparent_60%)]" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Hero search bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur xl:flex-row xl:items-center xl:justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              LiveBigger · Property Search
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
              Find a place that fits you and your roommates.
            </h1>
            <p className="text-sm text-slate-400">
              Use natural language or filters to search by vibe, budget, commute, and group compatibility.
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-3 xl:mt-0 xl:min-w-[380px]">
            <div className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 transition hover:border-sky-500/50">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                placeholder='Try: "2 bed in Brooklyn, under 3k, near subway"'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] text-sky-300 border border-sky-500/40">
                <Sparkles className="h-3 w-3 inline mr-1" />
                AI search
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-time availability</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-sky-400" />
                <span>Verified-only toggle in filters</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Main grid */}
        <section className="grid gap-5 lg:grid-cols-[260px,minmax(0,1.3fr),minmax(0,1fr)]">
          {/* Filters panel */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur h-fit"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-100">Filters</h2>
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Tune budget, rooms, and verification for your group.
            </p>

            {/* Budget slider */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Budget per person</span>
                <span className="text-slate-200">${budget}</span>
              </div>
              <input
                type="range"
                min={1200}
                max={4000}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-400 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$1,200</span>
                <span>$4,000</span>
              </div>
            </div>

            {/* Quick filters */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: "Verified only", sub: "ID, income, face" },
                { label: "Pet-friendly", sub: "Cats or dogs" },
                { label: "Near subway", sub: "< 10 min walk" },
                { label: "Roommate fit", sub: "High compatibility" },
              ].map((filter) => (
                <button
                  key={filter.label}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-left text-slate-200 hover:border-sky-500/50 transition-colors"
                >
                  <p className="font-medium">{filter.label}</p>
                  <p className="text-[10px] text-slate-500">{filter.sub}</p>
                </button>
              ))}
            </div>
          </motion.aside>

          {/* 3D property cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-100">Featured for you</h2>
                <p className="text-[11px] text-slate-400">AI-picked listings that match your budget and roommate profile.</p>
              </div>
              <div className="flex gap-1">
                <button className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-sky-400">
                  <Grid className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-500 hover:text-slate-300">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Card deck */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 xl:flex xl:overflow-x-auto xl:pb-2">
              {MOCK_PROPERTIES.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="group relative h-[280px] min-w-[240px] max-w-full xl:max-w-[260px] cursor-pointer rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden"
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    transform: hoveredId === property.id
                      ? "translateY(-8px) scale(1.02)"
                      : "translateY(0) scale(1)",
                    transition: "transform 0.2s ease-out",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-[55%] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
                    <div className="absolute left-3 top-3 flex items-center gap-2 text-[10px]">
                      {property.isAiPick && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI pick
                        </span>
                      )}
                      <span className="rounded-full bg-slate-900/80 px-2 py-1 text-slate-200 border border-slate-700/80">
                        {property.neighborhood}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute inset-x-0 bottom-0 h-[48%] flex flex-col justify-between px-4 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
                    <div>
                      <p className="text-xs text-sky-400 font-medium">{property.price}</p>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-50 mt-0.5">
                        {property.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {property.beds > 0
                          ? `${property.beds} bd · ${property.baths} ba`
                          : "Private room · Shared bath"}
                        {property.area > 0 && ` · ${property.area} sq ft`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span>Good roommate fit</span>
                      </div>
                      <button className="rounded-lg bg-sky-500 px-3 py-1.5 text-[10px] font-medium text-slate-950 shadow-[0_4px_20px_rgba(56,189,248,0.4)] hover:bg-sky-400 transition-colors">
                        View details
                      </button>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200 ${
                      hoveredId === property.id ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.4), 0 20px 60px rgba(15,23,42,0.9)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Map panel */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur h-fit"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-slate-100">Map</h2>
                <p className="text-[11px] text-slate-400">Explore neighborhoods with pins.</p>
              </div>
              <button className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] text-slate-200 hover:border-sky-500/50">
                Toggle 3D
              </button>
            </div>

            <div className="relative h-[260px] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(34,197,94,0.1),_transparent_60%),_linear-gradient(135deg,#0f172a,#0f172a)]">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:32px_32px]" />
              </div>

              {/* Map pins */}
              {MOCK_PROPERTIES.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="absolute flex flex-col items-center text-[10px]"
                  style={{
                    left: `${25 + index * 22}%`,
                    top: `${30 + index * 12}%`,
                  }}
                >
                  <motion.div
                    animate={{
                      y: hoveredId === p.id ? -4 : 0,
                      scale: hoveredId === p.id ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <div className="h-6 w-6 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.6)] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-slate-950" />
                      </div>
                      <div className="absolute bottom-[-6px] left-1/2 h-3 w-[2px] -translate-x-1/2 bg-sky-400/70" />
                    </div>
                  </motion.div>
                  <span className="mt-1.5 rounded-full bg-slate-900/95 px-2 py-0.5 text-slate-100 border border-slate-700/80 whitespace-nowrap">
                    {p.price}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-slate-500">
              Hover cards to highlight pins. Click to view listing details.
            </p>
          </motion.aside>
        </section>
      </div>
    </div>
  );
}
