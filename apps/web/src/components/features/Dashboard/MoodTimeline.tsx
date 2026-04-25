"use client";

import { motion } from "framer-motion";

type MoodPoint = { time: string; mood: string; emoji: string };

export function MoodTimeline({ data }: { data: MoodPoint[] }) {
  const current = data[data.length - 1];
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-semibold">Today's Mood Timeline</p>
        <button className="rounded-md border border-white/20 px-2 py-1 text-xs">Log mood</button>
      </div>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <motion.div
            key={`${item.time}-${item.mood}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative flex items-center gap-3"
          >
            <span className={`grid h-8 w-8 place-content-center rounded-full ${idx === data.length - 1 ? "bg-cyan-400/30" : "bg-white/10"}`}>
              {item.emoji}
            </span>
            <div>
              <p className="text-sm capitalize">{item.mood}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {current && <p className="mt-3 text-xs text-cyan-300">Current mood: {current.mood}</p>}
    </article>
  );
}
