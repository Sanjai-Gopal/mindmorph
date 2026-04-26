"use client";

import { addDays, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";

type DayPoint = { date: string; minutes: number };
type Props = {
  data: DayPoint[];
  selectedDate?: string | null;
  onDaySelect?: (date: string) => void;
};

function color(minutes: number) {
  if (minutes === 0) return "bg-slate-700/60";
  if (minutes < 30) return "bg-emerald-300/40";
  if (minutes < 60) return "bg-emerald-400/70";
  return "bg-emerald-500";
}

export function StudyHeatmap({ data, selectedDate, onDaySelect }: Props) {
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

  const weeks: DayPoint[][] = [];
  for (let i = 0; i < mapped.length; i += 7) weeks.push(mapped.slice(i, i + 7));

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-lg font-semibold">Study Heatmap</p>
      <div className="overflow-x-auto">
        <div className="min-w-[740px]">
          <div className="mb-2 ml-12 flex items-center gap-[7px] text-[10px] uppercase tracking-wide text-gray-400">
            {weeks.map((week) => (
              <span key={`month-${week[0].date}`} className="w-[18px] text-center">
                {format(new Date(week[0].date), "MMM").slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-[2px] flex flex-col gap-[7px] text-[10px] text-gray-400">
              <span className="h-4">Mon</span>
              <span className="h-4">Wed</span>
              <span className="h-4">Fri</span>
            </div>
            <div className="flex gap-[5px]">
              {weeks.map((week) => (
                <div key={`week-${week[0].date}`} className="grid grid-rows-7 gap-[5px]">
                  {Array.from({ length: 7 }).map((_, row) => {
                    const d = week[row];
                    if (!d) return <div key={`${week[0].date}-empty-${row}`} className="h-4 w-4" />;
                    const isSelected = (selectedDate || selected?.date) === d.date;
                    return (
                      <button
                        key={d.date}
                        title={`${d.date}: ${d.minutes} min`}
                        onClick={() => {
                          setSelected(d);
                          onDaySelect?.(d.date);
                        }}
                        className={`h-4 w-4 rounded-sm ${color(d.minutes)} ${isSelected ? "ring-2 ring-cyan-300" : ""} transition hover:scale-110`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span>0min</span>
        <span className="h-2 w-5 rounded bg-slate-700/60" />
        <span className="h-2 w-5 rounded bg-emerald-300/40" />
        <span className="h-2 w-5 rounded bg-emerald-400/70" />
        <span className="h-2 w-5 rounded bg-emerald-500" />
        <span>90min+</span>
      </div>
      {selected && (
        <p className="mt-2 text-xs text-cyan-300">
          {selected.date}: {selected.minutes} minutes studied
        </p>
      )}
    </article>
  );
}
