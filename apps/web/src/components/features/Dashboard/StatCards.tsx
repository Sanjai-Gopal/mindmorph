"use client";

import { motion } from "framer-motion";
import { Flame, Gauge, Sparkles, Timer } from "lucide-react";

type Stats = {
  totalHours: number;
  todayHours: number;
  streak: number;
  focusScore: number;
  transformedCount: number;
  trends: { hours: number; streak: number; focus: number; transforms: number };
};

export function StatCards({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Total Study Hours",
      value: `${stats.totalHours.toFixed(1)}h`,
      sub: `Today ${stats.todayHours.toFixed(1)}h`,
      trend: stats.trends.hours,
      icon: Timer
    },
    {
      label: "Current Streak",
      value: `${stats.streak} days`,
      sub: stats.streak > 3 ? "On fire" : "Keep going",
      trend: stats.trends.streak,
      icon: Flame
    },
    {
      label: "Focus Score",
      value: `${Math.round(stats.focusScore)}`,
      sub: "0-100",
      trend: stats.trends.focus,
      icon: Gauge
    },
    {
      label: "Content Transformed",
      value: `${stats.transformedCount}`,
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
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <item.icon className={`h-5 w-5 ${item.label === "Current Streak" && stats.streak > 3 ? "animate-pulse text-rose-300" : "text-cyan-300"}`} />
            <span className={`text-xs ${item.trend >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {item.trend >= 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
            </span>
          </div>
          <p className="mt-3 text-3xl font-black">{item.value}</p>
          <p className="text-sm text-gray-300">{item.label}</p>
          <p className="text-xs text-gray-400">{item.sub}</p>
        </motion.article>
      ))}
    </section>
  );
}
