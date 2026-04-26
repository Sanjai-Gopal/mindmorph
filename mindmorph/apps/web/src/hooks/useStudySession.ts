import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useStudyStore } from "@/stores/study-store";

export function useStudySession() {
  const {
    isRunning,
    isBreak,
    studyDuration,
    breakDuration,
    timeRemaining,
    sessionSeconds,
    totalStudiedSeconds,
    setRunning,
    setBreak,
    setTimeRemaining,
    setSessionSeconds,
    setTotalStudiedSeconds,
    resetSession
  } = useStudyStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      const nextRemaining = Math.max(0, useStudyStore.getState().timeRemaining - 1);
      const current = useStudyStore.getState();

      useStudyStore.getState().setTimeRemaining(nextRemaining);
      useStudyStore.getState().setSessionSeconds(current.sessionSeconds + 1);
      if (!current.isBreak) {
        useStudyStore.getState().setTotalStudiedSeconds(current.totalStudiedSeconds + 1);
      }

      if (nextRemaining <= 0) {
        const nowBreak = !current.isBreak;
        useStudyStore.getState().setBreak(nowBreak);
        useStudyStore.getState().setTimeRemaining(
          nowBreak ? current.breakDuration * 60 : current.studyDuration * 60
        );
        toast.success(nowBreak ? "Break started. Breathe and reset." : "Back to focus mode.");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const progress = useMemo(() => {
    const total = (isBreak ? breakDuration : studyDuration) * 60;
    return total <= 0 ? 0 : 1 - timeRemaining / total;
  }, [isBreak, breakDuration, studyDuration, timeRemaining]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const stop = () => resetSession();
  const skipBreak = () => {
    setBreak(false);
    setTimeRemaining(studyDuration * 60);
    setRunning(true);
    toast("Break skipped. Back to work.");
  };
  const addFiveMinutes = () => setTimeRemaining(timeRemaining + 5 * 60);
  const updateDurations = (studyMins: number, breakMins: number) => {
    useStudyStore.getState().setStudyDuration(studyMins);
    useStudyStore.getState().setBreakDuration(breakMins);
  };

  return {
    isRunning,
    isBreak,
    studyDuration,
    breakDuration,
    timeRemaining,
    sessionSeconds,
    totalStudiedSeconds,
    progress,
    start,
    pause,
    stop,
    skipBreak,
    addFiveMinutes,
    updateDurations,
    setSessionSeconds,
    setTotalStudiedSeconds
  };
}
