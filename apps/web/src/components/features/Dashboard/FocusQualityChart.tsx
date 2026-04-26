"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Point = { day: string; thisWeek: number; lastWeek: number };

export function FocusQualityChart({ data }: { data: Point[] }) {
  const best = [...data].sort((a, b) => b.thisWeek - a.thisWeek)[0];
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Focus Quality Over Time</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="thisWeek" stroke="#22d3ee" fill="url(#focusGrad)" />
            <Line type="monotone" dataKey="lastWeek" stroke="#a78bfa" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-cyan-300">
        Your best focus: {best?.day ?? "Tuesday"} mornings
      </p>
    </article>
  );
}
