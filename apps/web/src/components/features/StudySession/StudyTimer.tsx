"use client";

import { motion } from "framer-motion";
import { Pause, Play, Plus, SkipForward, Square } from "lucide-react";

type Props = {
  timeRemaining: number;
  progress: number;
  isRunning: boolean;
  isBreak: boolean;
  studyDuration: number;
  breakDuration: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipBreak: () => void;
  onAddFive: () => void;
  onDurationChange: (study: number, breakMins: number) => void;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function StudyTimer(props: Props) {
  const {
    timeRemaining,
    progress,
    isRunning,
    isBreak,
    studyDuration,
    breakDuration,
    onStart,
    onPause,
    onStop,
    onSkipBreak,
    onAddFive,
    onDurationChange
  } = props;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const ringColor = timeRemaining > 600 ? "#4ade80" : timeRemaining > 180 ? "#facc15" : "#f87171";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-gray-300">{isBreak ? "Break Timer" : "Focus Timer"}</p>
      <div className="mt-3 flex justify-center">
        <svg className="h-44 w-44 -rotate-90">
          <circle cx="72" cy="72" r={radius} stroke="#1f2937" strokeWidth="10" fill="none" />
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.4 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="pointer-events-none absolute mt-16 text-center">
          <p className="text-3xl font-black">{formatTime(timeRemaining)}</p>
          <p className="text-xs text-gray-400">{isBreak ? "Recharge" : "Deep Work"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <label className="rounded border border-white/10 p-2">
          Study (min)
          <input
            type="number"
            min={10}
            max={90}
            className="mt-1 w-full rounded bg-black/30 px-2 py-1"
            value={studyDuration}
            onChange={(e) => onDurationChange(Number(e.target.value), breakDuration)}
          />
        </label>
        <label className="rounded border border-white/10 p-2">
          Break (min)
          <input
            type="number"
            min={3}
            max={30}
            className="mt-1 w-full rounded bg-black/30 px-2 py-1"
            value={breakDuration}
            onChange={(e) => onDurationChange(studyDuration, Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={onStart} className="rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium">
          <Play className="mx-auto h-4 w-4" />
        </button>
        <button onClick={onPause} className="rounded-lg bg-amber-500/90 px-3 py-2 text-sm font-medium">
          <Pause className="mx-auto h-4 w-4" />
        </button>
        <button onClick={onStop} className="rounded-lg bg-rose-500/90 px-3 py-2 text-sm font-medium">
          <Square className="mx-auto h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={onSkipBreak} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <SkipForward className="h-3 w-3" /> Skip break
          </span>
        </button>
        <button onClick={onAddFive} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add 5 min
          </span>
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">{isRunning ? "Session running" : "Paused"}</p>
    </section>
  );
}
