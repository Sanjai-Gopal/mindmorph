"use client";

import { addDays, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";

type DayPoint = { date: string; minutes: number };

function color(minutes: number) {
  if (minutes === 0) return "bg-slate-700/60";
  if (minutes < 30) return "bg-emerald-300/40";
  if (minutes < 60) return "bg-emerald-400/70";
  return "bg-emerald-500";
}

export function StudyHeatmap({ data }: { data: DayPoint[] }) {
  const [selected, setSelected] = useState<DayPoint | null>(null);
  const mapped = useMemo(() => {
    const lookup = new Map(data.map((d) => [d.date, d.minutes]));
    const start = subDays(startOfDay(new Date()), 89);
    return Array.from({ length: 90 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, "yyyy-MM-dd");
      return { date: key, minutes: lookup.get(key) ?? 0 };
    });
  }, [data]);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-lg font-semibold">Study Heatmap</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(18, minmax(0,1fr))" }}>
        {mapped.map((d) => (
          <button
            key={d.date}
            title={`${d.date}: ${d.minutes} min`}
            onClick={() => setSelected(d)}
            className={`h-4 w-4 rounded-sm ${color(d.minutes)} transition hover:scale-110`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span>0m</span>
        <span className="h-2 w-5 rounded bg-slate-700/60" />
        <span className="h-2 w-5 rounded bg-emerald-300/40" />
        <span className="h-2 w-5 rounded bg-emerald-400/70" />
        <span className="h-2 w-5 rounded bg-emerald-500" />
        <span>90m+</span>
      </div>
      {selected && (
        <p className="mt-2 text-xs text-cyan-300">
          {selected.date}: {selected.minutes} minutes studied
        </p>
      )}
    </article>
  );
}
