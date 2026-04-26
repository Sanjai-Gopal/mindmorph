"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { subject: string; hours: number };

export function TopSubjects({ data }: { data: Item[] }) {
  const top = [...data].sort((a, b) => b.hours - a.hours)[0];
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Top Subjects</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="subject" type="category" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={90} />
            <Tooltip />
            <Bar dataKey="hours" fill="#38bdf8" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-cyan-300">
        You&apos;ve spent most time on {top?.subject ?? "Data Structures"}
      </p>
    </article>
  );
}
