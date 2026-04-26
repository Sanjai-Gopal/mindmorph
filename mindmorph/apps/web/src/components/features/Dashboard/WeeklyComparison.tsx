"use client";

import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type DayCard = {
  day: string;
  date: string;
  isoDate: string;
  minutes: number;
  engagement: number;
  subjects: string[];
  spark: Array<{ v: number }>;
  isToday?: boolean;
};

type Props = {
  data: DayCard[];
  selectedDate?: string | null;
  onSelect?: (date: string) => void;
};

export function WeeklyComparison({ data, selectedDate, onSelect }: Props) {
  const selected = data.find((d) => d.isoDate === selectedDate) || data.find((d) => d.isToday) || data[0];
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
            onClick={() => onSelect?.(item.isoDate)}
            className={`rounded-xl border p-3 text-left ${selected?.isoDate === item.isoDate ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20"} ${item.isToday ? "ring-1 ring-cyan-300/30" : ""}`}
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
      {selected && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
          <p className="font-semibold text-cyan-200">
            {selected.day}, {selected.date}
          </p>
          <p className="mt-1 text-gray-300">
            {selected.minutes} min studied, avg engagement {selected.engagement}%
          </p>
          <p className="text-xs text-gray-400">Subjects: {selected.subjects.length ? selected.subjects.join(", ") : "General"}</p>
        </div>
      )}
    </article>
  );
}
