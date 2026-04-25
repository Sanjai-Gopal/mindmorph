"use client";

import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type DayCard = {
  day: string;
  date: string;
  minutes: number;
  engagement: number;
  subjects: string[];
  spark: Array<{ v: number }>;
  isToday?: boolean;
};

export function WeeklyComparison({ data }: { data: DayCard[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-lg font-semibold">Weekly Comparison</p>
      <div className="grid gap-2 md:grid-cols-7">
        {data.map((item, idx) => (
          <motion.button
            key={item.day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`rounded-xl border p-3 text-left ${item.isToday ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20"}`}
          >
            <p className="text-xs text-gray-400">{item.day}</p>
            <p className="text-sm font-semibold">{item.date}</p>
            <p className="mt-1 text-xs">{item.minutes} min</p>
            <p className="text-xs">Eng: {item.engagement}%</p>
            <p className="line-clamp-1 text-xs text-gray-400">{item.subjects.join(", ")}</p>
            <div className="mt-2 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.spark}>
                  <Line type="monotone" dataKey="v" stroke="#22d3ee" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.button>
        ))}
      </div>
    </article>
  );
}
