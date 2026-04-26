"use client";

import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

type Item = { style: string; value: number };

export function LearningStyleRadar({ data }: { data: Item[] }) {
  const dominant = [...data].sort((a, b) => b.value - a.value)[0]?.style ?? "Narrative";
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <p className="text-lg font-semibold">Learning Style Breakdown</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="style" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
            <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} animationDuration={950} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-cyan-300">Your dominant style: {dominant} Learner</p>
      <p className="text-xs text-gray-400">
        You retain best when content aligns with this format. Narrative learners thrive with stories,
        examples, and contextual explanations.
      </p>
    </motion.article>
  );
}
