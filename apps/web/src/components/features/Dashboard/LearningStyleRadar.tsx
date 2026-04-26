"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

type Item = { style: string; value: number };

export function LearningStyleRadar({ data }: { data: Item[] }) {
  const dominant = [...data].sort((a, b) => b.value - a.value)[0]?.style ?? "Narrative";
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Learning Style Breakdown</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="style" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
            <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-cyan-300">Your dominant style: {dominant} Learner</p>
      <p className="text-xs text-gray-400">You retain best when content aligns with this format.</p>
    </article>
  );
}
