"use client";

import { motion } from "framer-motion";

type Props = {
  moodLabel: string;
  confidence: number;
  checkInText: string;
  onCheckInTextChange: (value: string) => void;
  onManualMood: (mood: string) => void;
};

const moodMap: Record<string, { emoji: string; color: string }> = {
  focused: { emoji: "🧠", color: "text-emerald-300" },
  motivated: { emoji: "🚀", color: "text-cyan-300" },
  curious: { emoji: "🤔", color: "text-indigo-300" },
  bored: { emoji: "😴", color: "text-amber-300" },
  frustrated: { emoji: "😣", color: "text-rose-300" },
  overwhelmed: { emoji: "😵", color: "text-rose-300" },
  neutral: { emoji: "🙂", color: "text-slate-300" }
};

export function MoodTracker({
  moodLabel,
  confidence,
  checkInText,
  onCheckInTextChange,
  onManualMood
}: Props) {
  const mood = moodMap[moodLabel] ?? moodMap.neutral;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-gray-300">Current Mood</p>
      <div className="mt-3 text-center">
        <motion.p
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl"
        >
          {mood.emoji}
        </motion.p>
        <p className={`mt-2 text-lg font-semibold capitalize ${mood.color}`}>{moodLabel}</p>
        <p className="text-xs text-gray-400">Confidence: {Math.round(confidence * 100)}%</p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs text-gray-400">Quick check-in</p>
        <div className="grid grid-cols-5 gap-2">
          {["😄", "🙂", "😐", "😣", "😵"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onManualMood(emoji)}
              className="rounded-md border border-white/20 bg-black/20 p-2"
            >
              {emoji}
            </button>
          ))}
        </div>
        <input
          value={checkInText}
          onChange={(e) => onCheckInTextChange(e.target.value)}
          placeholder="What's on your mind?"
          className="mt-3 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
        />
      </div>
    </section>
  );
}
