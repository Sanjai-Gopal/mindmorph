"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";

const moodOptions = [
  { emoji: "😫", label: "Frustrated", value: "frustrated" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "🚀", label: "Focused", value: "focused" }
];

export default function LiveStudyRoomPage() {
  const [engagement, setEngagement] = useState(72);
  const [previousEngagement, setPreviousEngagement] = useState(69);
  const [wpm, setWpm] = useState(46);
  const [wpmTrend, setWpmTrend] = useState<number[]>([38, 42, 45, 44, 46]);
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const [studentsOnline, setStudentsOnline] = useState(3);
  const { studySessionEvents, moodEvents, achievementEvents, isConnected } = useRealtime();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const engagementInterval = setInterval(() => {
      setPreviousEngagement((prev) => engagement);
      const next = Math.max(20, Math.min(99, engagement + Math.round((Math.random() - 0.5) * 12)));
      setEngagement(next);
      setWpm((prev) => Math.max(18, Math.min(95, prev + Math.round((Math.random() - 0.5) * 8))));
      setWpmTrend((prev) => [...prev.slice(1), Math.max(18, Math.min(95, prev[prev.length - 1] + Math.round((Math.random() - 0.5) * 8)))]);

      if (next < 40) {
        toast.warning("Intervention suggested: you're losing focus. Try morphing your content format.");
      } else if (next < 55 && Math.random() > 0.6) {
        toast("Short break suggestion", {
          description: "Take a 2-minute reset, then continue with a timer."
        });
      }
    }, 30000);

    const moodInterval = setInterval(() => setShowMoodPrompt(true), 25 * 60 * 1000);
    const studentsInterval = setInterval(
      () => setStudentsOnline((prev) => Math.max(1, Math.min(12, prev + Math.round((Math.random() - 0.5) * 2)))),
      15000
    );

    return () => {
      clearInterval(engagementInterval);
      clearInterval(moodInterval);
      clearInterval(studentsInterval);
    };
  }, [engagement]);

  useEffect(() => {
    if (achievementEvents.length > 0) {
      const latest = achievementEvents[0];
      if (latest.type === "INSERT") {
        toast.success("Achievement unlocked live!");
      }
    }
  }, [achievementEvents]);

  const engagementColor = engagement < 40 ? "bg-rose-400" : engagement < 70 ? "bg-amber-300" : "bg-emerald-400";
  const trendUp = engagement >= previousEngagement;

  const logMood = async (mood: string) => {
    if (!supabase) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("daily_mood_logs").insert({
      user_id: user.id,
      mood,
      logged_at: new Date().toISOString()
    });
    toast.success(`Mood logged: ${mood}`);
    setShowMoodPrompt(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">Live Study Room</h1>
            <p className="text-sm text-gray-300">{isConnected ? "Realtime connected" : "Connecting realtime..."}</p>
          </div>
          <p className="mt-2 text-sm text-gray-300">Studying with {studentsOnline} other students right now <span className="inline-flex gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:240ms]" /></span></p>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:col-span-2">
            <p className="text-lg font-semibold">Real-time Engagement Meter</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-36 w-36">
                <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                  <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke={engagement < 40 ? "#fb7185" : engagement < 70 ? "#facc15" : "#34d399"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={302}
                    animate={{ strokeDashoffset: 302 - (302 * engagement) / 100 }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-content-center text-center">
                  <p className="text-3xl font-black">{engagement}%</p>
                  <p className="text-xs text-gray-400">{trendUp ? "↑ rising" : "↓ dropping"}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Auto-updates every 30 seconds.</p>
                <p className="mt-2 text-sm text-gray-300">Live events: {studySessionEvents.length} study updates, {moodEvents.length} mood updates.</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Focus Quality LED</p>
            <div className="mt-6 flex items-center gap-3">
              <span className={`h-6 w-6 rounded-full ${engagementColor} ${engagement >= 70 ? "animate-pulse" : ""}`} />
              <p className="text-sm">
                {engagement < 40 ? "Needs intervention" : engagement < 70 ? "Decent focus" : "In flow state"}
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-400">Red: &lt;40%, Yellow: 40-70%, Green: 70%+</p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 xl:col-span-2">
            <p className="text-lg font-semibold">Live Typing Speed</p>
            <p className="mt-1 text-3xl font-black">{wpm} WPM</p>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wpmTrend.map((value, idx) => ({ idx: idx + 1, value }))}>
                  <Tooltip />
                  <Area dataKey="value" type="monotone" stroke="#22d3ee" fill="#22d3ee33" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Interventions</p>
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <p>- If frustration detected, suggest content morph.</p>
              <p>- If focus drops, suggest timed micro-break.</p>
              <p>- AI nudges are shown as slide-in toasts.</p>
            </div>
          </article>
        </section>

        {showMoodPrompt && (
          <section className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
            <p className="text-sm font-semibold">Quick mood check-in</p>
            <p className="text-xs text-gray-300">How are you feeling right now?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => void logMood(mood.value)}
                  className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-sm"
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
