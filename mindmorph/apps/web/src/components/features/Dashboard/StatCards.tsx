"use client";

import { motion } from "framer-motion";
import { Flame, Gauge, Sparkles, Timer } from "lucide-react";
import { useEffect, useState } from "react";

type Stats = {
  totalHours: number;
  todayHours: number;
  streak: number;
  focusScore: number;
  transformedCount: number;
  trends: { hours: number; streak: number; focus: number; transforms: number };
};

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const duration = 700;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(value * progress);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

export function StatCards({ stats }: { stats: Stats }) {
  const gauge = Math.max(0, Math.min(100, Math.round(stats.focusScore)));
  const gaugeOffset = 188 - (188 * gauge) / 100;
  const items = [
    {
      label: "Total Study Hours",
      value: stats.totalHours,
      valueSuffix: "h",
      decimals: 1,
      sub: `Today ${stats.todayHours.toFixed(1)}h`,
      trend: stats.trends.hours,
      icon: Timer
    },
    {
      label: "Current Streak",
      value: stats.streak,
      valueSuffix: " days",
      decimals: 0,
      sub: stats.streak > 3 ? "On fire" : "Keep going",
      trend: stats.trends.streak,
      icon: Flame
    },
    {
      label: "Focus Score",
      value: gauge,
      valueSuffix: "",
      decimals: 0,
      sub: "0-100",
      trend: stats.trends.focus,
      icon: Gauge
    },
    {
      label: "Content Transformed",
      value: stats.transformedCount,
      valueSuffix: "",
      decimals: 0,
      sub: "Morph sessions",
      trend: stats.trends.transforms,
      icon: Sparkles
    }
  ];
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, idx) => (
        <motion.article
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] p-4 shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center justify-between">
            <item.icon className={`h-5 w-5 ${item.label === "Current Streak" && stats.streak > 3 ? "animate-pulse text-rose-300" : "text-cyan-300"}`} />
            <span className={`text-xs ${item.trend >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {item.trend >= 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
            </span>
          </div>
          {item.label === "Focus Score" ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-16 w-16">
                <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90">
                  <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.16)" strokeWidth="6" fill="none" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#22d3ee"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={188}
                    strokeDashoffset={gaugeOffset}
                  />
                </svg>
                <span className="absolute inset-0 grid place-content-center text-sm font-bold">
                  <AnimatedNumber value={item.value} decimals={item.decimals} />
                </span>
              </div>
              <p className="text-3xl font-black">
                <AnimatedNumber value={item.value} suffix={item.valueSuffix} decimals={item.decimals} />
              </p>
            </div>
          ) : (
            <p className="mt-3 text-3xl font-black">
              <AnimatedNumber value={item.value} suffix={item.valueSuffix} decimals={item.decimals} />
            </p>
          )}
          <p className="text-sm text-gray-300">{item.label}</p>
          <p className="text-xs text-gray-400">{item.sub}</p>
        </motion.article>
      ))}
    </section>
  );
}
