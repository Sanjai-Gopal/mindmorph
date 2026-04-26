import { differenceInCalendarDays } from "date-fns";

export type SessionForXp = {
  durationMinutes: number;
  engagementScore: number;
  streakDays: number;
  format: "visual" | "story" | "challenge" | "interactive";
  previouslyUsedFormats: string[];
};

export type UserGamificationSnapshot = {
  id: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalSessions: number;
  totalTransformations: number;
  totalStudyMinutes: number;
  studiedDates: string[];
  studyHours: number[];
  usedFormats: string[];
  longestSessionMinutes?: number;
  lastActiveDate?: string | null;
  achievements: string[];
};

export type AchievementDefinition = {
  id:
    | "first_steps"
    | "streak_starter"
    | "streak_master"
    | "focus_king"
    | "content_creator"
    | "night_owl"
    | "early_bird"
    | "perfect_week"
    | "marathon"
    | "variety";
  title: string;
  description: string;
};

export const LEVELS = [
  { level: 1, name: "Beginner", minXp: 0 },
  { level: 2, name: "Learner", minXp: 100 },
  { level: 3, name: "Scholar", minXp: 250 },
  { level: 4, name: "Knowledge Seeker", minXp: 500 },
  { level: 5, name: "Focus Apprentice", minXp: 1000 },
  { level: 6, name: "Study Warrior", minXp: 2000 },
  { level: 7, name: "Learning Master", minXp: 4000 },
  { level: 8, name: "Knowledge Sage", minXp: 8000 },
  { level: 9, name: "Focus Legend", minXp: 16000 },
  { level: 10, name: "Grand Master", minXp: 32000 }
];

type LeaderboardItem = {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  highlighted?: boolean;
};

const REQUIRED_FORMATS = ["visual", "story", "challenge", "interactive"] as const;

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_steps", title: "First Steps", description: "Complete first session" },
  { id: "streak_starter", title: "Streak Starter", description: "3-day streak" },
  { id: "streak_master", title: "Streak Master", description: "7-day streak" },
  { id: "focus_king", title: "Focus King", description: "10 hours total" },
  { id: "content_creator", title: "Content Creator", description: "5 transformations" },
  { id: "night_owl", title: "Night Owl", description: "Study after 10 PM" },
  { id: "early_bird", title: "Early Bird", description: "Study before 7 AM" },
  { id: "perfect_week", title: "Perfect Week", description: "Study every day for a week" },
  { id: "marathon", title: "Marathon", description: "2-hour session" },
  { id: "variety", title: "Variety", description: "Use all 4 content formats" }
];

export class GamificationEngine {
  calculateXP(sessionData: SessionForXp): number {
    const durationXp = Math.max(0, Math.floor(sessionData.durationMinutes));
    const engagementXp = Math.max(0, Math.floor(sessionData.engagementScore * 2));
    const streakBonus = Math.max(0, sessionData.streakDays * 5);
    const varietyBonus = sessionData.previouslyUsedFormats.includes(sessionData.format) ? 0 : 10;
    const perfectBonus = sessionData.engagementScore >= 90 ? 25 : 0;
    return durationXp + engagementXp + streakBonus + varietyBonus + perfectBonus;
  }

  checkLevelUp(user: UserGamificationSnapshot): {
    leveledUp: boolean;
    newLevel: number;
    xpToNextLevel: number;
  } {
    const resolvedLevel = [...LEVELS].reverse().find((l) => user.xp >= l.minXp)?.level ?? 1;
    const next = LEVELS.find((l) => l.level === resolvedLevel + 1);
    return {
      leveledUp: resolvedLevel > user.level,
      newLevel: resolvedLevel,
      xpToNextLevel: next ? Math.max(0, next.minXp - user.xp) : 0
    };
  }

  checkAchievements(user: UserGamificationSnapshot): string[] {
    const unlocked = new Set(user.achievements);
    const gained: string[] = [];
    const unlock = (id: string, condition: boolean) => {
      if (condition && !unlocked.has(id)) {
        unlocked.add(id);
        gained.push(id);
      }
    };

    unlock("first_steps", user.totalSessions >= 1);
    unlock("streak_starter", user.streak >= 3);
    unlock("streak_master", user.streak >= 7);
    unlock("focus_king", user.totalStudyMinutes >= 600);
    unlock("content_creator", user.totalTransformations >= 5);
    unlock("night_owl", user.studyHours.some((h) => h >= 22));
    unlock("early_bird", user.studyHours.some((h) => h < 7));
    unlock("perfect_week", new Set(user.studiedDates.map((d) => d.slice(0, 10))).size >= 7);
    unlock("variety", REQUIRED_FORMATS.every((f) => user.usedFormats.includes(f)));
    unlock("marathon", (user.longestSessionMinutes ?? 0) >= 120);

    return gained;
  }

  getAchievementProgress(user: UserGamificationSnapshot, id: AchievementDefinition["id"]): number {
    switch (id) {
      case "first_steps":
        return Math.min(100, Math.round((user.totalSessions / 1) * 100));
      case "streak_starter":
        return Math.min(100, Math.round((user.streak / 3) * 100));
      case "streak_master":
        return Math.min(100, Math.round((user.streak / 7) * 100));
      case "focus_king":
        return Math.min(100, Math.round((user.totalStudyMinutes / 600) * 100));
      case "content_creator":
        return Math.min(100, Math.round((user.totalTransformations / 5) * 100));
      case "night_owl":
        return user.studyHours.some((h) => h >= 22) ? 100 : 0;
      case "early_bird":
        return user.studyHours.some((h) => h < 7) ? 100 : 0;
      case "perfect_week":
        return Math.min(100, Math.round((new Set(user.studiedDates.map((d) => d.slice(0, 10))).size / 7) * 100));
      case "marathon":
        return Math.min(100, Math.round(((user.longestSessionMinutes ?? 0) / 120) * 100));
      case "variety": {
        const used = new Set(user.usedFormats);
        const count = REQUIRED_FORMATS.filter((f) => used.has(f)).length;
        return Math.min(100, Math.round((count / REQUIRED_FORMATS.length) * 100));
      }
      default:
        return 0;
    }
  }

  updateStreak(
    user: UserGamificationSnapshot,
    todayIso = new Date().toISOString()
  ): { currentStreak: number; streakUpdated: boolean } {
    const today = new Date(todayIso);
    const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (!last) return { currentStreak: 1, streakUpdated: true };

    const diff = differenceInCalendarDays(today, last);
    if (diff <= 0) return { currentStreak: user.streak, streakUpdated: false };
    if (diff === 1) return { currentStreak: user.streak + 1, streakUpdated: true };

    // Weekend exemption: if missed day(s) but all missed are weekend only.
    let exemption = true;
    for (let i = 1; i < diff; i += 1) {
      const d = new Date(last);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      if (day !== 0 && day !== 6) exemption = false;
    }
    return {
      currentStreak: exemption ? user.streak : 1,
      streakUpdated: true
    };
  }

  getLeaderboard(
    type: "weekly" | "monthly" | "all-time",
    users: Array<{ id: string; name: string; weeklyXp: number; monthlyXp: number; totalXp: number }>,
    currentUserId?: string
  ): LeaderboardItem[] {
    const sorted = [...users]
      .map((u) => ({
        userId: u.id,
        name: u.name,
        xp: type === "weekly" ? u.weeklyXp : type === "monthly" ? u.monthlyXp : u.totalXp
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);
    return sorted.map((u, idx) => ({
      rank: idx + 1,
      ...u,
      highlighted: u.userId === currentUserId
    }));
  }
}

export const gamificationEngine = new GamificationEngine();
