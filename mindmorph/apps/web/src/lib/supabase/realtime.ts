import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type StudySessionEvent = {
  type: "INSERT" | "UPDATE" | "DELETE";
  newRecord: Record<string, unknown> | null;
  oldRecord: Record<string, unknown> | null;
};

export type MoodLogEvent = {
  type: "INSERT" | "UPDATE" | "DELETE";
  newRecord: Record<string, unknown> | null;
  oldRecord: Record<string, unknown> | null;
};

export type AchievementEvent = {
  type: "INSERT" | "UPDATE" | "DELETE";
  newRecord: Record<string, unknown> | null;
  oldRecord: Record<string, unknown> | null;
};

class RealTimeService {
  private channels = new Set<RealtimeChannel>();

  private subscribe(
    channelName: string,
    table: string,
    userId: string,
    callback: (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new: Record<string, unknown> | null;
      old: Record<string, unknown> | null;
    }) => void
  ) {
    const supabase = createClient();
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.add(channel);
    return () => {
      this.channels.delete(channel);
      void supabase.removeChannel(channel);
    };
  }

  subscribeToStudySession(userId: string, callback: (event: StudySessionEvent) => void) {
    return this.subscribe(`study-sessions-${userId}`, "study_sessions", userId, (payload) => {
      callback({
        type: payload.eventType,
        newRecord: payload.new,
        oldRecord: payload.old
      });
    });
  }

  subscribeToMoodUpdates(userId: string, callback: (event: MoodLogEvent) => void) {
    return this.subscribe(`mood-logs-${userId}`, "daily_mood_logs", userId, (payload) => {
      callback({
        type: payload.eventType,
        newRecord: payload.new,
        oldRecord: payload.old
      });
    });
  }

  subscribeToAchievements(userId: string, callback: (event: AchievementEvent) => void) {
    return this.subscribe(`achievements-${userId}`, "achievements", userId, (payload) => {
      callback({
        type: payload.eventType,
        newRecord: payload.new,
        oldRecord: payload.old
      });
    });
  }

  unsubscribeAll() {
    const supabase = createClient();
    this.channels.forEach((channel) => {
      void supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realTimeService = new RealTimeService();
