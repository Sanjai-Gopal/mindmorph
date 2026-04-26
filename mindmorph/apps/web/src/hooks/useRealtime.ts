import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  realTimeService,
  type AchievementEvent,
  type MoodLogEvent,
  type StudySessionEvent
} from "@/lib/supabase/realtime";

type UseRealtimeState = {
  studySessionEvents: StudySessionEvent[];
  moodEvents: MoodLogEvent[];
  achievementEvents: AchievementEvent[];
  isConnected: boolean;
};

export function useRealtime() {
  const [state, setState] = useState<UseRealtimeState>({
    studySessionEvents: [],
    moodEvents: [],
    achievementEvents: [],
    isConnected: false
  });

  useEffect(() => {
    let mounted = true;
    let cleanupStudy = () => {};
    let cleanupMood = () => {};
    let cleanupAchievement = () => {};

    const run = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      cleanupStudy = realTimeService.subscribeToStudySession(user.id, (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          studySessionEvents: [event, ...prev.studySessionEvents].slice(0, 50)
        }));
      });

      cleanupMood = realTimeService.subscribeToMoodUpdates(user.id, (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          moodEvents: [event, ...prev.moodEvents].slice(0, 50)
        }));
      });

      cleanupAchievement = realTimeService.subscribeToAchievements(user.id, (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          achievementEvents: [event, ...prev.achievementEvents].slice(0, 50)
        }));
      });
    };

    void run();

    return () => {
      mounted = false;
      cleanupStudy();
      cleanupMood();
      cleanupAchievement();
    };
  }, []);

  return state;
}
