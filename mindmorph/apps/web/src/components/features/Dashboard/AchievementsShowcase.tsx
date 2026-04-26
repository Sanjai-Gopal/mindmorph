"use client";

import { Lock, Trophy } from "lucide-react";

type Achievement = { id: string; title: string; unlocked: boolean; progress: number };

export function AchievementsShowcase({ items }: { items: Achievement[] }) {
  const unlockedCount = items.filter((i) => i.unlocked).length;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Achievements Showcase</p>
      <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-3 ${item.unlocked ? "border-amber-400/40 bg-amber-300/10 shadow-[0_0_24px_rgba(251,191,36,0.2)]" : "border-white/10 bg-black/20 grayscale"}`}
          >
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              {item.unlocked ? <Trophy className="h-4 w-4 text-amber-300" /> : <Lock className="h-4 w-4" />}
              {item.title}
            </p>
            <div className="mt-2 h-1.5 rounded bg-white/10">
              <div className="h-full rounded bg-cyan-400" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-300">
        {Math.max(0, 2 - unlockedCount)} more to reach Focus Master!
      </p>
    </article>
  );
}
