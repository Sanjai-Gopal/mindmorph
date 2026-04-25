"use client";

import { LEVELS } from "@/lib/gamification/engine";

export function LevelBadge({ level }: { level: number }) {
  const levelInfo = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-sm">
      <span className="text-amber-300">★</span>
      <span>
        Level {levelInfo.level}: {levelInfo.name}
      </span>
    </div>
  );
}
