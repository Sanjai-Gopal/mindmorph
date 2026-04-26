"use client";

import { motion } from "framer-motion";
import { LEVELS } from "@/lib/gamification/engine";
import { LevelBadge } from "@/components/features/Gamification/LevelBadge";

type Props = {
  xp: number;
  level: number;
};

export function XpProgress({ xp, level }: Props) {
  const current = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const next = LEVELS.find((l) => l.level === level + 1);
  const denom = next ? next.minXp - current.minXp : 1;
  const progress = next ? Math.min(100, ((xp - current.minXp) / denom) * 100) : 100;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">XP & Level Progression</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-28 w-28">
          <svg className="h-28 w-28 -rotate-90">
            <circle cx="56" cy="56" r="46" stroke="#334155" strokeWidth="10" fill="none" />
            <motion.circle
              cx="56"
              cy="56"
              r="46"
              stroke="#22d3ee"
              strokeWidth="10"
              fill="none"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * progress) / 100}
              animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="text-lg font-black">{Math.round(progress)}%</p>
          </div>
        </div>
        <div>
          <LevelBadge level={level} />
          <motion.p className="mt-2 text-3xl font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {xp.toLocaleString()} XP
          </motion.p>
          <p className="text-xs text-gray-400">
            {next ? `${Math.max(0, next.minXp - xp)} XP to Level ${next.level}` : "Max level reached"}
          </p>
          <ul className="mt-2 text-xs text-gray-300">
            <li>- Bonus challenge rewards</li>
            <li>- Advanced content morph styles</li>
            <li>- Priority AI guidance</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
