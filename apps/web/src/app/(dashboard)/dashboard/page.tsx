"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import { GreetingBar } from "@/components/features/Dashboard/GreetingBar";
import { StatCards } from "@/components/features/Dashboard/StatCards";
import { StudyHeatmap } from "@/components/features/Dashboard/StudyHeatmap";
import { LearningStyleRadar } from "@/components/features/Dashboard/LearningStyleRadar";
import { FocusQualityChart } from "@/components/features/Dashboard/FocusQualityChart";
import { MoodTimeline } from "@/components/features/Dashboard/MoodTimeline";
import { AchievementsShowcase } from "@/components/features/Dashboard/AchievementsShowcase";
import { TopSubjects } from "@/components/features/Dashboard/TopSubjects";
import { Recommendations } from "@/components/features/Dashboard/Recommendations";
import { WeeklyComparison } from "@/components/features/Dashboard/WeeklyComparison";

type Session = {
  subject: string | null;
  engagement_score: number | null;
  duration_seconds: number | null;
  created_at: string;
};

const filters = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "3 months", days: 90 },
  { key: "all", label: "All time", days: 3650 }
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<(typeof filters)[number]["key"]>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Learner");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transformCount, setTransformCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [hasData, setHasData] = useState(true);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
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
            .select("subject,engagement_score,duration_seconds,created_at")
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
    void run();
  }, [supabase, range]);

  const totalHours = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0) / 3600, 0);
  const todayHours = sessions
    .filter((s) => s.created_at.startsWith(format(new Date(), "yyyy-MM-dd")))
    .reduce((acc, s) => acc + (s.duration_seconds ?? 0) / 3600, 0);
  const focusScore =
    sessions.length === 0
      ? 0
      : sessions.reduce((acc, s) => acc + (s.engagement_score ?? 0), 0) / sessions.length;

  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const key = s.created_at.slice(0, 10);
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

  const focusWeekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => ({
    day,
    thisWeek: Math.max(30, Math.min(96, Math.round(focusScore + (idx - 3) * 2 + Math.random() * 8))),
    lastWeek: Math.max(25, Math.min(92, Math.round(focusScore + (idx - 4) * 1.5 + Math.random() * 10)))
  }));

  const weeklyCards = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => ({
    day,
    date: format(subDays(new Date(), 6 - idx), "MMM d"),
    minutes: Math.round((sessions[idx]?.duration_seconds ?? 1800) / 60),
    engagement: Math.round(sessions[idx]?.engagement_score ?? focusScore ?? 60),
    subjects: [sessions[idx]?.subject ?? "General"],
    spark: Array.from({ length: 8 }, () => ({ v: Math.round(45 + Math.random() * 45) })),
    isToday: idx === 6
  }));

  const moodData = [
    { time: "09:10", mood: "curious", emoji: "🤔" },
    { time: "11:20", mood: "focused", emoji: "🧠" },
    { time: "14:30", mood: "motivated", emoji: "🚀" },
    { time: "18:05", mood: "calm", emoji: "🙂" }
  ];

  const radarData = [
    { style: "Visual", value: 65 },
    { style: "Narrative", value: 82 },
    { style: "Interactive", value: 74 },
    { style: "Logical", value: 58 }
  ];

  const achievements = [
    { id: "1", title: "First Session", unlocked: true, progress: 100 },
    { id: "2", title: "3-Day Streak", unlocked: streak >= 3, progress: Math.min(100, (streak / 3) * 100) },
    { id: "3", title: "Focus Master", unlocked: focusScore > 80, progress: Math.min(100, (focusScore / 80) * 100) },
    { id: "4", title: "10 Hour Club", unlocked: totalHours >= 10, progress: Math.min(100, (totalHours / 10) * 100) }
  ];

  const recommendations = [
    { id: "r1", text: "Study Physics in the morning when your focus peaks.", action: "Schedule now" },
    { id: "r2", text: "Try Visual Mode for Chemistry - retention appears higher.", action: "Open transform" },
    { id: "r3", text: "You haven't reviewed Biology in 5 days.", action: "Start review" }
  ];

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ sessions, totalHours, focusScore }, null, 2)], {
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
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-40 animate-pulse rounded-2xl bg-white/10" />
          ))}
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
            <StudyHeatmap data={heatmapData} />
          </div>
          <LearningStyleRadar data={radarData} />
        </section>

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

        <WeeklyComparison data={weeklyCards} />
      </motion.div>
    </DashboardLayout>
  );
}
