"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { LearningStyle } from "@/hooks/useOnboarding";

type Item = { style: LearningStyle; value: number };

export function ResultsStep({
  data,
  primaryStyle,
  secondaryStyle,
  onStart
}: {
  data: Item[];
  primaryStyle: LearningStyle;
  secondaryStyle: LearningStyle;
  onStart: () => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-3xl font-black">Your Learning Profile</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="style" tick={{ fill: "#cbd5e1" }} />
              <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          <p className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-3 text-sm">
            Primary style: <strong>{primaryStyle}</strong>
          </p>
          <p className="rounded-lg border border-indigo-300/30 bg-indigo-400/10 p-3 text-sm">
            Secondary style: <strong>{secondaryStyle}</strong>
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
            <li>We will adapt content format to your dominant style.</li>
            <li>We will cue interventions based on your focus windows.</li>
            <li>You can change these preferences later in settings.</li>
          </ul>
          <button onClick={onStart} className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-black">
            Start Learning
          </button>
        </div>
      </div>
    </section>
  );
}
