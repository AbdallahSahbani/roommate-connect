import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

type Point = { date: string; value: number };
type RentIndexResponse = {
  seriesName: string;
  unit: "USD" | string;
  lastUpdated: string;
  points: Point[];
  forecast?: Point[];
};

// Mock data for demonstration - replace with real API endpoint
const MOCK_DATA: RentIndexResponse = {
  seriesName: "ZORI Rent Index (New York)",
  unit: "USD",
  lastUpdated: new Date().toISOString(),
  points: [
    { date: "2023-01-01", value: 2450 },
    { date: "2023-02-01", value: 2480 },
    { date: "2023-03-01", value: 2510 },
    { date: "2023-04-01", value: 2530 },
    { date: "2023-05-01", value: 2560 },
    { date: "2023-06-01", value: 2590 },
    { date: "2023-07-01", value: 2620 },
    { date: "2023-08-01", value: 2650 },
    { date: "2023-09-01", value: 2670 },
    { date: "2023-10-01", value: 2690 },
    { date: "2023-11-01", value: 2710 },
    { date: "2023-12-01", value: 2730 },
    { date: "2024-01-01", value: 2750 },
    { date: "2024-02-01", value: 2770 },
    { date: "2024-03-01", value: 2790 },
    { date: "2024-04-01", value: 2810 },
    { date: "2024-05-01", value: 2830 },
    { date: "2024-06-01", value: 2850 },
    { date: "2024-07-01", value: 2870 },
    { date: "2024-08-01", value: 2890 },
    { date: "2024-09-01", value: 2910 },
    { date: "2024-10-01", value: 2930 },
    { date: "2024-11-01", value: 2950 },
    { date: "2024-12-01", value: 2970 },
  ],
  forecast: [
    { date: "2025-01-01", value: 2990 },
    { date: "2025-02-01", value: 3010 },
    { date: "2025-03-01", value: 3030 },
    { date: "2025-04-01", value: 3050 },
    { date: "2025-05-01", value: 3070 },
    { date: "2025-06-01", value: 3090 },
  ],
};

const fetcher = async (_url: string): Promise<RentIndexResponse> => {
  // Return mock data for now - replace with real API call
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_DATA;
};

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDateShort(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

function computeYoY(points: Point[]) {
  if (points.length < 14) return null;
  const last = points[points.length - 1]?.value;
  const prev = points[points.length - 13]?.value;
  if (!Number.isFinite(last) || !Number.isFinite(prev) || prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

function computeMoM(points: Point[]) {
  if (points.length < 2) return null;
  const last = points[points.length - 1]?.value;
  const prev = points[points.length - 2]?.value;
  if (!Number.isFinite(last) || !Number.isFinite(prev) || prev === 0) return null;
  return ((last - prev) / prev) * 100;
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_90px_rgba(0,0,0,0.55)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.07] to-transparent" />
      {children}
    </div>
  );
}

function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const styles =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "warn"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
      : tone === "bad"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
      : "border-white/10 bg-white/5 text-white/70";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-56 rounded bg-white/10" />
      <div className="mt-3 h-3 w-80 rounded bg-white/10" />
      <div className="mt-8 h-72 w-full rounded-xl bg-white/10" />
    </div>
  );
}

export function RentForecast() {
  const navigate = useNavigate();
  const [city, setCity] = useState("New York, NY");
  const [months, setMonths] = useState(48);

  const dataUrl = useMemo(() => {
    const q = new URLSearchParams({
      city,
      months: String(months),
    });
    return `/api/rent-index?${q.toString()}`;
  }, [city, months]);

  const { data, error, isLoading, mutate, isValidating } = useSWR<RentIndexResponse>(
    dataUrl,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 1000 * 60 * 10,
      dedupingInterval: 1000 * 20,
      errorRetryCount: 3,
      errorRetryInterval: 1500,
    }
  );

  const mergedChartData = useMemo(() => {
    if (!data) return [];
    const history = (data.points || []).map((p) => ({
      date: p.date,
      actual: p.value,
      forecast: null as number | null,
    }));
    const forecast = (data.forecast || []).map((p) => ({
      date: p.date,
      actual: null as number | null,
      forecast: p.value,
    }));

    const map = new Map<string, { date: string; actual: number | null; forecast: number | null }>();
    for (const row of history) map.set(row.date, row);
    for (const row of forecast) {
      const existing = map.get(row.date);
      if (existing) map.set(row.date, { ...existing, forecast: row.forecast });
      else map.set(row.date, row);
    }
    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.points?.length) return null;
    const last = data.points[data.points.length - 1]?.value ?? null;
    const yoy = computeYoY(data.points);
    const mom = computeMoM(data.points);
    return { last, yoy, mom };
  }, [data]);

  const freshness = useMemo(() => {
    if (!data?.lastUpdated) return null;
    const t = new Date(data.lastUpdated).getTime();
    if (Number.isNaN(t)) return null;
    const minutes = Math.floor((Date.now() - t) / (1000 * 60));
    return minutes;
  }, [data?.lastUpdated]);

  const [insights, setInsights] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string>("");

  const generateInsights = async () => {
    if (!data) return;
    setInsights("");
    setInsightsError("");
    setInsightsLoading(true);
    
    // Mock insights for demo
    await new Promise((r) => setTimeout(r, 1500));
    setInsights(`• Current rent level: ${formatMoney(data.points[data.points.length - 1]?.value || 0)}
• Year-over-year growth: +${computeYoY(data.points)?.toFixed(1) || "N/A"}%
• Month-over-month trend: Steady upward pressure
• Market condition: Competitive with limited inventory
• Forecast: Expect continued 2-3% quarterly increases
• Renter advice: Lock in rates now before spring surge
• Best timing: January-February typically sees lower competition
• Negotiation tip: Longer lease terms may yield 3-5% discount`);
    setInsightsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-black font-bold"
            >
              R
            </button>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">ROOMATES</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                Market Dashboard
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Matches", path: "/browse" },
              { label: "Listings", path: "/properties-3d" },
              { label: "Messages", path: "/messages" },
            ].map((x) => (
              <button 
                key={x.label} 
                onClick={() => navigate(x.path)}
                className="transition hover:text-white"
              >
                {x.label}
              </button>
            ))}
          </nav>
          <button 
            onClick={() => navigate("/auth")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
          >
            Login
          </button>
        </div>
      </header>

      {/* Status Strip */}
      <div className="border-b border-white/5 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-2 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Market feed {isValidating ? "syncing…" : "active"}
          </div>
          <div className="flex items-center gap-2">
            <StatusPill label="AI insights available" tone="neutral" />
            <StatusPill
              label={
                freshness == null
                  ? "Freshness: unknown"
                  : freshness <= 60
                  ? `Freshness: ${freshness}m`
                  : `Freshness: ${Math.floor(freshness / 60)}h`
              }
              tone={freshness == null ? "warn" : freshness <= 120 ? "good" : "warn"}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Controls + Chart */}
          <div className="lg:col-span-8">
            <GlassCard className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xl font-semibold tracking-tight">
                    Monthly rental rates
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Live series + forecast (from your real data source).
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      City
                    </div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 w-56 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      Window
                    </div>
                    <select
                      value={months}
                      onChange={(e) => setMonths(parseInt(e.target.value, 10))}
                      className="mt-1 w-40 bg-transparent text-sm text-white outline-none"
                    >
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={72}>72 months</option>
                    </select>
                  </div>
                  <button
                    onClick={() => mutate()}
                    className="h-[72px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/80 hover:bg-white/10"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-6">
                {isLoading ? (
                  <Skeleton />
                ) : error ? (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                    <div className="font-semibold">Data feed error</div>
                    <div className="mt-1 opacity-90">{String(error.message || error)}</div>
                    <button
                      onClick={() => mutate()}
                      className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                    >
                      Retry
                    </button>
                  </div>
                ) : !data?.points?.length ? (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center">
                    <div className="text-lg font-semibold">No data returned</div>
                    <div className="mt-2 text-sm text-white/60">
                      Your endpoint returned an empty series.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={data.seriesName || "Rent Index"} tone="neutral" />
                      <StatusPill
                        label={`Last updated: ${new Date(data.lastUpdated).toLocaleString()}`}
                        tone="neutral"
                      />
                      {stats?.yoy != null && (
                        <StatusPill
                          label={`YoY: ${stats.yoy >= 0 ? "+" : ""}${stats.yoy.toFixed(1)}%`}
                          tone={stats.yoy >= 0 ? "warn" : "good"}
                        />
                      )}
                      {stats?.mom != null && (
                        <StatusPill
                          label={`MoM: ${stats.mom >= 0 ? "+" : ""}${stats.mom.toFixed(2)}%`}
                          tone={Math.abs(stats.mom) < 1 ? "neutral" : stats.mom > 0 ? "warn" : "good"}
                        />
                      )}
                      {stats?.last != null && (
                        <StatusPill label={`Current: ${formatMoney(stats.last)}`} tone="good" />
                      )}
                    </div>
                    <div className="mt-5 h-[360px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mergedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={formatDateShort}
                            stroke="rgba(255,255,255,0.45)"
                            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                            minTickGap={24}
                          />
                          <YAxis
                            tickFormatter={(v) => `$${Math.round(v)}`}
                            stroke="rgba(255,255,255,0.45)"
                            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                            width={70}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(0,0,0,0.85)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 12,
                            }}
                            labelStyle={{ color: "rgba(255,255,255,0.75)" }}
                            formatter={(val: number, name: string) => [
                              formatMoney(Number(val)),
                              name === "actual" ? "Actual" : "Forecast",
                            ]}
                            labelFormatter={(label: string) => formatDateShort(String(label))}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual"
                            stroke="rgba(0,255,230,0.95)"
                            strokeWidth={2.5}
                            dot={false}
                            connectNulls
                          />
                          <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Forecast"
                            stroke="rgba(180,120,255,0.95)"
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            dot={false}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right: Insights */}
          <div className="lg:col-span-4">
            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">AI market insights</div>
                  <div className="mt-1 text-sm text-white/60">
                    AI-powered trend analysis and recommendations.
                  </div>
                </div>
                <StatusPill label="AI" tone="neutral" />
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  disabled={!data || insightsLoading}
                  onClick={generateInsights}
                  className={[
                    "rounded-xl px-4 py-3 text-sm font-medium transition",
                    !data || insightsLoading
                      ? "cursor-not-allowed bg-white/5 text-white/40"
                      : "bg-cyan-500 text-black hover:bg-cyan-400",
                  ].join(" ")}
                >
                  {insightsLoading ? "Generating…" : "Generate insights"}
                </button>
                {insightsError && (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                    {insightsError}
                  </div>
                )}
                {!insights && !insightsLoading && (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                    Click "Generate insights" to get a concise trend brief.
                  </div>
                )}
                {insights && (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/75 whitespace-pre-wrap">
                    {insights}
                  </div>
                )}
              </div>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="mt-6">
                <div className="text-sm font-semibold">Quick Stats</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Avg Rent</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {stats?.last ? formatMoney(stats.last) : "—"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">YoY Change</div>
                    <div className={`mt-1 text-lg font-semibold ${stats?.yoy && stats.yoy > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {stats?.yoy ? `${stats.yoy >= 0 ? "+" : ""}${stats.yoy.toFixed(1)}%` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
