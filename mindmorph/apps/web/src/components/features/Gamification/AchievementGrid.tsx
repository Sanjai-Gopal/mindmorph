"use client";

import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";

export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  unlockedAt?: string | null;
  recent?: boolean;
};

export function AchievementGrid({ achievements }: { achievements: AchievementItem[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Achievement Gallery</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {achievements.map((a) => (
          <motion.article
            key={a.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 ${a.unlocked ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-black/20 grayscale"}`}
          >
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              {a.unlocked ? <Trophy className="h-4 w-4 text-amber-300" /> : <Lock className="h-4 w-4" />}
              {a.title}
            </p>
            <p className="mt-1 text-xs text-gray-300">{a.description}</p>
            <div className="mt-2 h-1.5 rounded bg-white/10">
              <div className="h-full rounded bg-cyan-400" style={{ width: `${a.progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              {a.unlockedAt ? `Unlocked ${new Date(a.unlockedAt).toLocaleDateString()}` : "Locked"}
            </p>
            {a.recent && <p className="text-[11px] text-emerald-300">Recently unlocked ✨</p>}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
