"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, endOfDay, format, isSameDay, startOfDay, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import { GreetingBar } from "@/components/features/Dashboard/GreetingBar";
import { StatCards } from "@/components/features/Dashboard/StatCards";
import { LearningStyleRadar } from "@/components/features/Dashboard/LearningStyleRadar";
import { FocusQualityChart } from "@/components/features/Dashboard/FocusQualityChart";
import { MoodTimeline } from "@/components/features/Dashboard/MoodTimeline";
import { AchievementsShowcase } from "@/components/features/Dashboard/AchievementsShowcase";
import { TopSubjects } from "@/components/features/Dashboard/TopSubjects";
import { Recommendations } from "@/components/features/Dashboard/Recommendations";
import { useRealtime } from "@/hooks/useRealtime";

const StudyHeatmap = dynamic(
  () => import("@/components/features/Dashboard/StudyHeatmap").then((mod) => mod.StudyHeatmap),
  { ssr: false }
);
const WeeklyComparison = dynamic(
  () => import("@/components/features/Dashboard/WeeklyComparison").then((mod) => mod.WeeklyComparison),
  { ssr: false }
);

type Session = {
  subject: string | null;
  engagement_score: number | null;
  duration_seconds: number | null;
  created_at: string;
  behavior_metrics?: {
    mood?: string;
    moodEmoji?: string;
  } | null;
};

const filters = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "3 months", days: 90 },
  { key: "all", label: "All time", days: 3650 }
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<(typeof filters)[number]["key"]>("30d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Learner");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transformCount, setTransformCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [hasData, setHasData] = useState(true);
  const [activeHeatmapDate, setActiveHeatmapDate] = useState<string | null>(null);
  const [activeWeeklyDay, setActiveWeeklyDay] = useState<string | null>(null);
  const { studySessionEvents, achievementEvents } = useRealtime();

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase unavailable");
      const days = filters.find((f) => f.key === range)?.days ?? 30;
      const since = subDays(new Date(), days).toISOString();

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setHasData(false);
        setLoading(false);
        return;
      }

      const [profileRes, sessionsRes, transformsRes] = await Promise.all([
        supabase.from("profiles").select("full_name,gamification").eq("id", user.id).single(),
        supabase
          .from("study_sessions")
          .select("subject,engagement_score,duration_seconds,created_at,behavior_metrics")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .order("created_at", { ascending: true }),
        supabase
          .from("content_transformations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", since)
      ]);

      const sessionRows = (sessionsRes.data ?? []) as Session[];
      setSessions(sessionRows);
      setTransformCount(transformsRes.count ?? 0);
      setHasData(sessionRows.length > 0);
      setName((profileRes.data?.full_name as string) || "Learner");
      setStreak(Number((profileRes.data?.gamification as { streak?: number } | null)?.streak ?? 1));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run();
  }, [supabase, range]);

  useEffect(() => {
    if (studySessionEvents.length > 0 || achievementEvents.length > 0) {
      void run();
    }
  }, [studySessionEvents.length, achievementEvents.length]);

  const totalHours = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0) / 3600, 0);
  const todayHours = sessions
    .filter((s) => isSameDay(new Date(s.created_at), new Date()))
    .reduce((acc, s) => acc + (s.duration_seconds ?? 0) / 3600, 0);
  const focusScore =
    sessions.length === 0
      ? 0
      : sessions.reduce((acc, s) => acc + (s.engagement_score ?? 0), 0) / sessions.length;

  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const key = format(new Date(s.created_at), "yyyy-MM-dd");
      map.set(key, (map.get(key) ?? 0) + Math.round((s.duration_seconds ?? 0) / 60));
    });
    return Array.from(map.entries()).map(([date, minutes]) => ({ date, minutes }));
  }, [sessions]);

  const subjectData = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const key = s.subject || "General";
      map.set(key, (map.get(key) ?? 0) + (s.duration_seconds ?? 0) / 3600);
    });
    return [...map.entries()]
      .map(([subject, hours]) => ({ subject, hours: Number(hours.toFixed(1)) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [sessions]);

  const focusWeekly = useMemo(() => {
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const thisWeekMap = new Map<number, { sum: number; count: number }>();
    const lastWeekMap = new Map<number, { sum: number; count: number }>();
    const today = new Date();
    const thisWeekStart = subDays(startOfDay(today), 6);
    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = endOfDay(subDays(thisWeekStart, 1));

    sessions.forEach((s) => {
      const created = new Date(s.created_at);
      const score = s.engagement_score ?? 0;
      const day = created.getDay();
      if (created >= thisWeekStart) {
        const prev = thisWeekMap.get(day) ?? { sum: 0, count: 0 };
        thisWeekMap.set(day, { sum: prev.sum + score, count: prev.count + 1 });
      } else if (created >= lastWeekStart && created <= lastWeekEnd) {
        const prev = lastWeekMap.get(day) ?? { sum: 0, count: 0 };
        lastWeekMap.set(day, { sum: prev.sum + score, count: prev.count + 1 });
      }
    });

    return weekday.slice(1).concat("Sun").map((dayLabel) => {
      const idx = weekday.indexOf(dayLabel);
      const thisWeek = thisWeekMap.get(idx);
      const lastWeek = lastWeekMap.get(idx);
      return {
        day: dayLabel,
        thisWeek: Math.round(thisWeek ? thisWeek.sum / thisWeek.count : 0),
        lastWeek: Math.round(lastWeek ? lastWeek.sum / lastWeek.count : 0)
      };
    });
  }, [sessions]);

  const weeklyCards = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(startOfDay(new Date()), 6), end: startOfDay(new Date()) });
    return days.map((day) => {
      const daySessions = sessions.filter((s) => isSameDay(new Date(s.created_at), day));
      const minutes = Math.round(daySessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0) / 60, 0));
      const engagement =
        daySessions.length === 0
          ? 0
          : Math.round(daySessions.reduce((acc, s) => acc + (s.engagement_score ?? 0), 0) / daySessions.length);
      const subjects = Array.from(new Set(daySessions.map((s) => s.subject || "General"))).slice(0, 2);
      return {
        day: format(day, "EEE"),
        date: format(day, "MMM d"),
        isoDate: format(day, "yyyy-MM-dd"),
        minutes,
        engagement,
        subjects,
        spark: daySessions.length
          ? daySessions.map((s) => ({ v: s.engagement_score ?? 0 }))
          : Array.from({ length: 6 }, (_, idx) => ({ v: Math.max(20, Math.round(focusScore - 8 + idx * 2)) })),
        isToday: isSameDay(day, new Date())
      };
    });
  }, [sessions, focusScore]);

  const moodData = useMemo(() => {
    const todaySessions = sessions
      .filter((s) => isSameDay(new Date(s.created_at), new Date()))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (todaySessions.length === 0) {
      return [
        { time: "09:00", mood: "curious", emoji: "🤔" },
        { time: "11:15", mood: "focused", emoji: "🧠" },
        { time: "14:40", mood: "motivated", emoji: "🚀" },
        { time: "18:20", mood: "calm", emoji: "🙂" }
      ];
    }
    return todaySessions.slice(-6).map((s) => {
      const guessedMood =
        s.engagement_score && s.engagement_score > 82
          ? "focused"
          : s.engagement_score && s.engagement_score > 70
            ? "motivated"
            : "curious";
      return {
        time: format(new Date(s.created_at), "HH:mm"),
        mood: s.behavior_metrics?.mood || guessedMood,
        emoji: s.behavior_metrics?.moodEmoji || (guessedMood === "focused" ? "🧠" : guessedMood === "motivated" ? "🚀" : "🤔")
      };
    });
  }, [sessions]);

  const radarData = useMemo(() => {
    if (subjectData.length < 4) {
      return [
        { style: "Visual", value: 64 },
        { style: "Narrative", value: 82 },
        { style: "Interactive", value: 71 },
        { style: "Logical", value: 59 }
      ];
    }
    return [
      { style: "Visual", value: Math.round(Math.min(95, 52 + subjectData[0].hours * 4)) },
      { style: "Narrative", value: Math.round(Math.min(95, 48 + subjectData[1].hours * 5)) },
      { style: "Interactive", value: Math.round(Math.min(95, 50 + subjectData[2].hours * 4.6)) },
      { style: "Logical", value: Math.round(Math.min(95, 46 + subjectData[3].hours * 4.8)) }
    ];
  }, [subjectData]);

  const achievements = [
    { id: "1", title: "First Session", unlocked: true, progress: 100 },
    { id: "2", title: "3-Day Streak", unlocked: streak >= 3, progress: Math.min(100, (streak / 3) * 100) },
    { id: "3", title: "Focus Master", unlocked: focusScore > 80, progress: Math.min(100, (focusScore / 80) * 100) },
    { id: "4", title: "10 Hour Club", unlocked: totalHours >= 10, progress: Math.min(100, (totalHours / 10) * 100) },
    { id: "5", title: "Deep Work Pro", unlocked: totalHours >= 20, progress: Math.min(100, (totalHours / 20) * 100) }
  ];

  const recommendations = [
    { id: "r1", text: "Study Physics in the morning when your focus peaks.", action: "Plan Morning Block", href: "/study" },
    { id: "r2", text: "Try Visual Mode for Chemistry - your retention is 40% higher.", action: "Open Transform", href: "/transform" },
    { id: "r3", text: "You haven't reviewed Biology in 5 days.", action: "Start Review", href: "/study" }
  ];

  const selectedDaySessions = activeHeatmapDate
    ? sessions.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === activeHeatmapDate)
    : [];

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ sessions, totalHours, focusScore, range }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmorph-analytics.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-white/10 xl:col-span-2" />
            <div className="h-80 animate-pulse rounded-2xl bg-white/10" />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-white/10 xl:col-span-2" />
            <div className="h-80 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
          <p className="text-lg font-semibold text-rose-300">Could not load analytics</p>
          <p className="text-sm text-gray-300">{error}</p>
          <button
            onClick={() => void run()}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-rose-300/40 px-3 py-2 text-sm text-rose-200"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-2xl font-bold">Start studying to see your analytics!</p>
          <p className="mt-2 text-gray-300">Once you complete sessions, rich insights appear here.</p>
          <Link href="/study" className="mt-5 inline-block rounded-full bg-cyan-400 px-6 py-3 font-semibold text-black">
            Go to Study Session
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setRange(f.key)}
                className={`rounded-full px-3 py-1 text-xs ${range === f.key ? "bg-cyan-400 text-black" : "border border-white/20"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={exportData} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm">
            <Download className="h-4 w-4" /> Export data
          </button>
        </div>

        <GreetingBar name={name} />
        <StatCards
          stats={{
            totalHours,
            todayHours,
            streak,
            focusScore,
            transformedCount: transformCount,
            trends: { hours: 12, streak: 8, focus: 6, transforms: 14 }
          }}
        />

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-white/10" />}>
              <StudyHeatmap data={heatmapData} onDaySelect={setActiveHeatmapDate} selectedDate={activeHeatmapDate} />
            </Suspense>
          </div>
          <LearningStyleRadar data={radarData} />
        </section>

        {activeHeatmapDate && (
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-sm font-semibold text-cyan-200">Sessions on {activeHeatmapDate}</p>
            {selectedDaySessions.length === 0 ? (
              <p className="mt-1 text-xs text-gray-300">No sessions recorded.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedDaySessions.map((session, idx) => (
                  <div key={`${session.created_at}-${idx}`} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-xs">
                    <p>{session.subject || "General"}</p>
                    <p className="text-gray-300">
                      {Math.round((session.duration_seconds ?? 0) / 60)} min • {session.engagement_score ?? 0}% focus
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <FocusQualityChart data={focusWeekly} />
          </div>
          <MoodTimeline data={moodData} />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <AchievementsShowcase items={achievements} />
          <TopSubjects data={subjectData.length ? subjectData : [{ subject: "Data Structures", hours: 5.2 }]} />
          <Recommendations items={recommendations} />
        </section>

        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white/10" />}>
          <WeeklyComparison data={weeklyCards} selectedDate={activeWeeklyDay} onSelect={setActiveWeeklyDay} />
        </Suspense>
      </motion.div>
    </DashboardLayout>
  );
}
