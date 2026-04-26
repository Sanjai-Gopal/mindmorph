"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Sparkles, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { StudyTimer } from "@/components/features/StudySession/StudyTimer";
import { ContentDisplay } from "@/components/features/StudySession/ContentDisplay";
import { MoodTracker } from "@/components/features/StudySession/MoodTracker";
import { BehaviorInsights } from "@/components/features/StudySession/BehaviorInsights";
import { InterventionModal } from "@/components/features/StudySession/InterventionModal";
import { AchievementPopup } from "@/components/features/StudySession/AchievementPopup";
import { useStudyStore } from "@/stores/study-store";
import { useStudySession } from "@/hooks/useStudySession";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { useMoodDetection } from "@/hooks/useMoodDetection";
import { createClient } from "@/lib/supabase/client";

const achievementMap: Record<string, string> = {
  first_session: "First session completed",
  streak_3: "3-day streak started",
  streak_7: "7-day focus legend",
  hour_1: "1 hour total study time",
  hour_10: "10 hours total study time",
  first_transform: "First content transformation used"
};

export default function StudyPage() {
  const supabase = useMemo(() => createClient(), []);
  const {
    subject,
    topic,
    notesOpen,
    notes,
    selectedFormat,
    originalContent,
    morphedContent,
    showMorphed,
    engagementScore,
    focusQuality,
    isRunning,
    transformedUsed,
    streakDays,
    achievements,
    setSubject,
    setTopic,
    setNotesOpen,
    setNotes,
    setFormat,
    setOriginalContent,
    setMorphedContent,
    setShowMorphed,
    setEngagementScore,
    setFocusQuality,
    markTransformationUsed,
    unlockAchievement
  } = useStudyStore();
  const session = useStudySession();
  const [checkInText, setCheckInText] = useState("");
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [achievementPopup, setAchievementPopup] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);
  const [engagementHistory, setEngagementHistory] = useState<Array<{ t: string; engagement: number }>>([
    { t: new Date().toLocaleTimeString(), engagement: engagementScore }
  ]);
  const [lowEngagementSeconds, setLowEngagementSeconds] = useState(0);

  const { metrics, engagementEstimate } = useBehaviorTracking({
    subject,
    topic,
    enabled: isRunning,
    onEngagementUpdate: setEngagementScore
  });

  const mood = useMoodDetection({
    text: checkInText || originalContent.slice(0, 240),
    typing: {
      speed: metrics.typingSpeedWpm,
      consistency: Math.max(0.1, 1 - metrics.focusLossCount * 0.08),
      errorRate: Math.min(0.5, metrics.tabSwitches * 0.03)
    },
    scroll: {
      scrollSpeed: metrics.scrollSpeed,
      pattern: metrics.scrollPattern,
      depth: metrics.scrollDepth
    },
    sessionDuration: Math.floor(session.totalStudiedSeconds / 60)
  });

  useEffect(() => {
    setFocusQuality(Math.round((engagementScore + engagementEstimate) / 2));
  }, [engagementScore, engagementEstimate, setFocusQuality]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEngagementHistory((prev) =>
        [...prev, { t: new Date().toLocaleTimeString(), engagement: Math.round(engagementScore) }].slice(-16)
      );
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [engagementScore]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setLowEngagementSeconds((sec) => {
        if (engagementScore < 40) return sec + 1;
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, engagementScore]);

  useEffect(() => {
    if (lowEngagementSeconds >= 180) {
      setInterventionOpen(true);
      toast("You seem stuck. Want a quick reset?");
      setLowEngagementSeconds(0);
    }
  }, [lowEngagementSeconds]);

  useEffect(() => {
    const channel = supabase
      .channel("study-session-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_sessions" },
        (payload) => {
          const score = Number((payload.new as { engagement_score?: number }).engagement_score ?? 0);
          if (score > 0) setEngagementScore(score);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, setEngagementScore]);

  useEffect(() => {
    const totalHours = session.totalStudiedSeconds / 3600;
    const queue: string[] = [];
    if (session.totalStudiedSeconds > 0 && !achievements.includes("first_session")) queue.push("first_session");
    if (streakDays >= 3 && !achievements.includes("streak_3")) queue.push("streak_3");
    if (streakDays >= 7 && !achievements.includes("streak_7")) queue.push("streak_7");
    if (totalHours >= 1 && !achievements.includes("hour_1")) queue.push("hour_1");
    if (totalHours >= 10 && !achievements.includes("hour_10")) queue.push("hour_10");
    if (transformedUsed && !achievements.includes("first_transform")) queue.push("first_transform");
    if (queue.length === 0) return;
    const next = queue[0];
    unlockAchievement(next);
    setAchievementPopup(achievementMap[next]);
    window.setTimeout(() => setAchievementPopup(null), 3400);
  }, [session.totalStudiedSeconds, streakDays, transformedUsed, achievements, unlockAchievement]);

  const handleTransform = async () => {
    if (!originalContent.trim() || transforming) return;
    setTransforming(true);
    try {
      const response = await fetch("/api/morph-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: originalContent,
          format: selectedFormat === "challenge" || selectedFormat === "interactive" ? "quiz" : "simple"
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not transform your content right now.");
      }
      setMorphedContent(typeof data.transformed === "string" ? data.transformed : data.transformed?.output ?? "");
      setShowMorphed(true);
      markTransformationUsed();
      toast.success("Content transformed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transformation failed. Please try again.");
    } finally {
      setTransforming(false);
    }
  };

  const calmBg = interventionOpen
    ? "bg-gradient-to-br from-sky-950/70 via-cyan-950/60 to-indigo-950/70"
    : "bg-gradient-to-br from-[#0b0e1a] via-[#100b22] to-[#121726]";

  return (
    <DashboardLayout>
      <div className={`rounded-2xl border border-white/10 p-3 md:p-4 ${calmBg}`}>
        <div className="grid gap-4 xl:grid-cols-[20%_55%_25%]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-gray-300">Session setup</p>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="mt-2 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm"
              />
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic"
                className="mt-2 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm"
              />
            </section>

            <StudyTimer
              timeRemaining={session.timeRemaining}
              progress={session.progress}
              isRunning={session.isRunning}
              isBreak={session.isBreak}
              studyDuration={session.studyDuration}
              breakDuration={session.breakDuration}
              onStart={session.start}
              onPause={session.pause}
              onStop={session.stop}
              onSkipBreak={session.skipBreak}
              onAddFive={session.addFiveMinutes}
              onDurationChange={session.updateDurations}
            />

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <p className="text-xs text-gray-400">Current format</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold capitalize text-cyan-300">
                <Sparkles className="h-4 w-4" /> {selectedFormat}
              </p>
              <div className="mt-3 space-y-2">
                <p>Time studied: {Math.floor(session.totalStudiedSeconds / 60)} min</p>
                <p className="inline-flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-cyan-300" /> Engagement: {Math.round(engagementScore)}%
                </p>
                <div>
                  <p>Focus quality</p>
                  <div className="mt-1 h-2 rounded bg-white/10">
                    <motion.div
                      className="h-2 rounded bg-gradient-to-r from-cyan-400 to-indigo-400"
                      animate={{ width: `${focusQuality}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className="min-h-[70vh]">
            <ContentDisplay
              originalContent={originalContent}
              morphedContent={morphedContent}
              showMorphed={showMorphed}
              selectedFormat={selectedFormat}
              engagementScore={engagementScore}
              onToggleMorphed={setShowMorphed}
              onTransform={handleTransform}
              transformLoading={transforming}
              onSelectFormat={setFormat}
              onToggleNotes={() => setNotesOpen(!notesOpen)}
              onContentChange={(value) => (showMorphed ? setMorphedContent(value) : setOriginalContent(value))}
            />
            <motion.aside
              animate={{ x: notesOpen ? 0 : 380 }}
              className="fixed right-4 top-24 z-30 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e1021] p-4 shadow-2xl"
            >
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium">
                <StickyNote className="h-4 w-4" /> Session Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-64 w-full rounded-md border border-white/20 bg-black/20 p-3 text-sm"
              />
            </motion.aside>
          </section>

          <aside className="space-y-4">
            <MoodTracker
              moodLabel={mood.moodLabel}
              confidence={mood.confidence}
              checkInText={checkInText}
              onCheckInTextChange={setCheckInText}
              onManualMood={(emoji) => {
                setCheckInText(`Manual mood check: ${emoji}`);
                toast(`Mood captured: ${emoji}`);
              }}
            />
            <BehaviorInsights
              metrics={metrics}
              history={engagementHistory}
              timeRemaining={session.timeRemaining}
            />
          </aside>
        </div>
      </div>
      <InterventionModal
        open={interventionOpen || mood.intervention.intervene}
        onClose={() => setInterventionOpen(false)}
        onTransform={handleTransform}
      />
      <AchievementPopup achievement={achievementPopup} />
    </DashboardLayout>
  );
}
