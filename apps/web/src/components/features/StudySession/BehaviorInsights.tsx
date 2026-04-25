"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BehaviorMetrics } from "@/hooks/useBehaviorTracking";

type Props = {
  metrics: BehaviorMetrics;
  history: Array<{ t: string; engagement: number }>;
  timeRemaining: number;
};

export function BehaviorInsights({ metrics, history, timeRemaining }: Props) {
  const insights = [
    metrics.typingSpeedWpm > 38
      ? "Your typing speed suggests high engagement 🚀"
      : "Typing speed is moderate; maybe add an interactive challenge.",
    `You've been focused for ${Math.floor(metrics.activeSeconds / 60)} minutes straight!`,
    `Consider a 2-minute break in ${Math.max(1, Math.floor(timeRemaining / 60) - 5)} minutes`
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-gray-300">Behavior Insights</p>
      <div className="mt-3 space-y-2">
        {insights.map((insight) => (
          <p key={insight} className="rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-gray-200">
            {insight}
          </p>
        ))}
      </div>
      <div className="mt-4 h-40 rounded-lg border border-white/10 bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip />
            <Line type="monotone" dataKey="engagement" stroke="#22d3ee" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
