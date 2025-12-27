"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import roommatesImg from "@/assets/roommates-collaboration.png";
import luxuryImg from "@/assets/luxury-living.png";

type Metric = {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatNumber(n: number, decimals = 0) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Subtle, high-end particle field */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const config = useMemo(
    () => ({
      density: 0.00009,
      maxParticles: 220,
      minParticles: 90,
      linkDist: 140,
      drift: 0.15,
      speed: 0.25,
      parallax: 0.03,
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const DPR = () => Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = DPR();
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particleCount = clamp(
      Math.floor(w * h * config.density),
      config.minParticles,
      config.maxParticles
    );
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      p: Math.random() * 0.9 + 0.1,
    }));

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const dx = nx - pointer.current.x;
      const dy = ny - pointer.current.y;
      pointer.current.vx = dx;
      pointer.current.vy = dy;
      pointer.current.x = nx;
      pointer.current.y = ny;
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(
        w * (0.5 + (pointer.current.x - 0.5) * 0.1),
        h * (0.35 + (pointer.current.y - 0.5) * 0.1),
        40,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.85
      );
      g.addColorStop(0, "rgba(0, 255, 230, 0.08)");
      g.addColorStop(0.35, "rgba(120, 0, 255, 0.06)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const px = pointer.current.x * w;
      const py = pointer.current.y * h;

      for (const p of particles) {
        p.x += p.vx + (pointer.current.vx * config.drift) * (1 - p.p);
        p.y += p.vy + (pointer.current.vy * config.drift) * (1 - p.p);

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const parX = (px - w / 2) * config.parallax * (1 - p.p);
        const parY = (py - h / 2) * config.parallax * (1 - p.p);
        const x = p.x + parX;
        const y = p.y + parY;

        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const maxD = config.linkDist;
          if (d2 < maxD * maxD) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / maxD) * 0.22;
            ctx.strokeStyle = `rgba(0,255,230,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
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
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.55)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
      {children}
    </div>
  );
}

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 220,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 220,
    damping: 18,
  });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={["will-change-transform", className].join(" ")}
    >
      <div style={{ transform: "translateZ(18px)" }}>{children}</div>
    </motion.div>
  );
}

function LiveMetric({
  metric,
  live = true,
}: {
  metric: Metric;
  live?: boolean;
}) {
  const [v, setV] = useState(metric.value);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setV((prev) => {
        const nudge =
          metric.label.includes("Accuracy") || metric.label.includes("Rate")
            ? (Math.random() - 0.5) * 0.06
            : (Math.random() - 0.5) * 18;
        const next = prev + nudge;
        if (metric.label.toLowerCase().includes("accuracy")) {
          return clamp(next, 93, 99.6);
        }
        return Math.max(metric.value * 0.7, next);
      });
    }, 900);
    return () => clearInterval(t);
  }, [live, metric.label, metric.value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {formatNumber(v, metric.decimals ?? 0)}
          {metric.suffix ?? ""}
        </span>
        {live && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
            Live
          </span>
        )}
      </div>
      <div className="text-xs tracking-wide text-white/60">{metric.label}</div>
    </div>
  );
}

function MorphHeadline() {
  const phrases = useMemo(
    () => [
      { a: "Live bigger,", b: "pay less." },
      { a: "Match smarter,", b: "stress less." },
      { a: "Rent safer,", b: "move faster." },
    ],
    []
  );
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % phrases.length), 3800);
    return () => clearInterval(t);
  }, [phrases.length]);

  return (
    <div className="relative">
      <motion.h1
        key={i}
        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-balance text-center text-5xl font-semibold tracking-tight text-white md:text-6xl"
      >
        <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {phrases[i].a}
        </span>{" "}
        <span className="bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent">
          {phrases[i].b}
        </span>
      </motion.h1>
      <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

function MatchConsole() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"renter" | "landlord">("renter");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  const [maxRent, setMaxRent] = useState(1800);
  const [bedrooms, setBedrooms] = useState("Any");
  const [intent, setIntent] = useState<"commute" | "budget" | "balanced">("balanced");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (maxRent) params.set("maxRent", maxRent.toString());
    if (bedrooms !== "Any") params.set("bedrooms", bedrooms);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <GlassCard className="mx-auto w-full max-w-5xl p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/70">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            Match Console
          </div>
          <div className="hidden h-6 w-px bg-white/10 md:block" />
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
            {(["renter", "landlord"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "rounded-full px-3 py-1 text-xs tracking-wide transition",
                  m === mode
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                ].join(" ")}
              >
                {m === "renter" ? "Renter" : "Landlord"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">Optimization:</span>
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1">
            {(["balanced", "budget", "commute"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setIntent(o)}
                className={[
                  "rounded-full px-3 py-1 text-xs tracking-wide transition",
                  o === intent
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                ].join(" ")}
              >
                {o === "balanced" ? "Balanced" : o === "budget" ? "Budget" : "Commute"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/60">
            Country
          </label>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option className="bg-black">United States</option>
              <option className="bg-black">Canada</option>
              <option className="bg-black">United Kingdom</option>
              <option className="bg-black">France</option>
              <option className="bg-black">Germany</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/60">
            City
          </label>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York, Boston, Hartford..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <div className="mt-2 text-xs text-white/45">
            Predictive intent:{" "}
            <span className="text-white/70">
              {intent === "budget"
                ? "budget-optimized"
                : intent === "commute"
                ? "commute-optimized"
                : "balanced"}
            </span>
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/60">
            Max Rent
          </label>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">${maxRent}</span>
              <span className="text-xs text-white/45">monthly</span>
            </div>
            <input
              type="range"
              min={600}
              max={5000}
              value={maxRent}
              onChange={(e) => setMaxRent(parseInt(e.target.value, 10))}
              className="mt-3 w-full accent-white/80"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/60">
            Bedrooms
          </label>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option className="bg-black">Any</option>
              <option className="bg-black">Studio</option>
              <option className="bg-black">1</option>
              <option className="bg-black">2</option>
              <option className="bg-black">3+</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-12">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className={[
              "group relative mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] px-4 py-4 text-left",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.5)]",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              <div className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">
                  {mode === "renter" ? "Initiate Match" : "List with Verification"}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {mode === "renter"
                    ? "Takes ~90 seconds • AI computes lifestyle + risk alignment"
                    : "Verify property & applicants • Reduce churn & non-payment risk"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/55">↳</span>
                <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70">
                  {intent.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

function FeatureNode({
  title,
  desc,
  chip,
  image,
}: {
  title: string;
  desc: string;
  chip: string;
  image?: string;
}) {
  return (
    <TiltCard className="h-full">
      <GlassCard className="h-full overflow-hidden">
        {image && (
          <div className="relative h-40 w-full overflow-hidden">
            <img src={image} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {chip}
            </div>
            <div className="h-10 w-10 rounded-xl border border-white/10 bg-black/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
          </div>
          <div className="mt-4 text-lg font-semibold text-white">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-white/60">{desc}</div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/55">
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              Signal
              <div className="mt-1 text-white/80">High</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              Risk
              <div className="mt-1 text-white/80">Modeled</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              Output
              <div className="mt-1 text-white/80">Ranked</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </TiltCard>
  );
}

export function Landing() {
  const navigate = useNavigate();
  
  const metrics: Metric[] = useMemo(
    () => [
      { label: "Active Matches", value: 51284, decimals: 0 },
      { label: "Verified Properties", value: 11093, decimals: 0 },
      { label: "Compatibility Accuracy", value: 97.8, decimals: 1, suffix: "%" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Particle / neural background */}
      <div className="absolute inset-0">
        <ParticleField />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(0,255,230,0.08),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black" />
      </div>

      {/* Top nav */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400 to-emerald-400 backdrop-blur-xl" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">ROOMMATES</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">
              Neural Housing
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          {[
            { label: "Home", path: "/" },
            { label: "Properties", path: "/properties-3d" },
            { label: "Roommates", path: "/browse" },
            { label: "Groups", path: "/groups" },
            { label: "Messages", path: "/messages" },
          ].map((x) => (
            <button
              key={x.label}
              className="transition hover:text-white"
              onClick={() => navigate(x.path)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide text-white/80 transition hover:bg-white/10"
        >
          Sign In
        </button>
      </div>

      {/* Hero */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide text-white/75">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
              AI-Powered Roommate Matching
              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/70">
                v2.0
              </span>
            </div>
          </div>
          <div className="mt-8">
            <MorphHeadline />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-white/60 md:text-base">
            Team up with verified roommates and discover trusted properties.
            Compatibility scores computed across lifestyle, finances, routines,
            and risk—so you don't gamble your lease on vibes.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/auth")}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
                <div className="absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
              </div>
              <span className="relative">Initiate Match</span>
              <span className="relative ml-2 text-white/70">↗</span>
            </motion.button>
            <button
              onClick={() => navigate("/become-landlord")}
              className="rounded-xl border border-white/10 bg-black/30 px-6 py-3 text-sm text-white/75 backdrop-blur-xl transition hover:bg-white/5 hover:text-white"
            >
              List with Verification
            </button>
          </div>

          {/* Metrics */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {metrics.map((m) => (
              <LiveMetric key={m.label} metric={m} />
            ))}
          </div>
        </div>

        {/* Match Console */}
        <div className="mt-12">
          <MatchConsole />
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide text-white/75">
                <span className="h-2 w-2 rounded-full bg-white/70" />
                Feature Stack
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Built for modern living
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/55">
              Every feature is engineered for trust, speed, and compatibility scoring.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureNode
              chip="Matching"
              title="AI Roommate Compatibility"
              desc="Neural models analyze lifestyle, routines, finances, and risk tolerance to surface ideal roommate matches."
              image={roommatesImg}
            />
            <FeatureNode
              chip="Properties"
              title="Verified Listings"
              desc="Every property verified through ID, ownership, and condition checks. No scams, no surprises."
              image={luxuryImg}
            />
            <FeatureNode
              chip="Groups"
              title="Group Formation"
              desc="Form or join roommate groups. Shared wishlists, budgets, and coordinated applications."
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg border border-white/10 bg-gradient-to-br from-cyan-400 to-emerald-400" />
              <span className="text-sm font-medium text-white/80">Roommates</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
              <button onClick={() => navigate("/privacy-policy")} className="hover:text-white">
                Privacy
              </button>
              <button onClick={() => navigate("/terms-of-service")} className="hover:text-white">
                Terms
              </button>
              <button onClick={() => navigate("/contact")} className="hover:text-white">
                Contact
              </button>
              <button onClick={() => navigate("/careers")} className="hover:text-white">
                Careers
              </button>
            </div>
            <div className="text-xs text-white/40">
              © 2026 Roommates. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
