"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Camera, Flame, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import {
  gamificationEngine,
  type UserGamificationSnapshot
} from "@/lib/gamification/engine";
import { XpProgress } from "@/components/features/Gamification/XpProgress";
import { AchievementGrid, type AchievementItem } from "@/components/features/Gamification/AchievementGrid";
import { Leaderboard } from "@/components/features/Gamification/Leaderboard";
import { AchievementCelebration } from "@/components/features/Gamification/AchievementCelebration";

const suggestionInterests = ["cricket", "anime", "cooking", "gaming", "space", "music"];

export default function ProfilePage() {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [name, setName] = useState("Learner");
  const [email, setEmail] = useState("unknown@example.com");
  const [memberSince, setMemberSince] = useState(new Date().toISOString());
  const [learningStyle, setLearningStyle] = useState("Narrative");
  const [attentionSpan, setAttentionSpan] = useState(25);
  const [peakFocusStart, setPeakFocusStart] = useState("09:00");
  const [peakFocusEnd, setPeakFocusEnd] = useState("11:00");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [xp, setXp] = useState(120);
  const [level, setLevel] = useState(2);
  const [streak, setStreak] = useState(1);
  const [longestStreak, setLongestStreak] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [avgSessionMinutes, setAvgSessionMinutes] = useState(0);
  const [bestDay, setBestDay] = useState("Tuesday");
  const [bestHour, setBestHour] = useState("09:00");
  const [transformCount, setTransformCount] = useState(0);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<"weekly" | "monthly" | "all-time">("weekly");
  const [celebration, setCelebration] = useState<{ open: boolean; title: string }>({
    open: false,
    title: ""
  });
  const [preferences, setPreferences] = useState({
    theme: "system",
    notifications: true,
    sound_effects: true,
    break_reminders: true,
    break_interval: 30,
    default_session_length: 25,
    default_content_format: "story",
    language: "English"
  });
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        return;
      }
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? "unknown@example.com");

      const [profileRes, sessionsRes, transformationsRes, interestsRes, achievementsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("study_sessions")
          .select("duration_seconds, engagement_score, started_at, content_format, created_at")
          .eq("user_id", user.id),
        supabase.from("content_transformations").select("id,created_at").eq("user_id", user.id),
        supabase.from("user_interests").select("interest").eq("user_id", user.id),
        supabase.from("achievements").select("*").eq("user_id", user.id)
      ]);

      const profile = profileRes.data;
      if (profile) {
        setName(profile.full_name || "Learner");
        setAvatarUrl(profile.avatar_url || "");
        setMemberSince(profile.created_at || new Date().toISOString());
        const cog = (profile.cognitive_profile || {}) as Record<string, unknown>;
        setLearningStyle(String(cog.learning_style || "Narrative"));
        setAttentionSpan(Number(cog.attention_span_minutes || 25));
        const hours = (cog.peak_focus_hours as string[] | undefined) || ["09:00", "11:00"];
        setPeakFocusStart(hours[0] || "09:00");
        setPeakFocusEnd(hours[1] || "11:00");
        const g = (profile.gamification || {}) as Record<string, unknown>;
        setXp(Number(g.xp || 0));
        setLevel(Number(g.level || 1));
        setStreak(Number(g.streak || 1));
        setLongestStreak(Number(g.longest_streak || 1));
        const prefs = (profile.preferences || {}) as Record<string, unknown>;
        setPreferences((prev) => ({
          ...prev,
          ...prefs
        }));
      }

      const sessions = sessionsRes.data ?? [];
      const minutes = sessions.reduce((a, s) => a + Math.round(Number(s.duration_seconds || 0) / 60), 0);
      setTotalMinutes(minutes);
      setTotalSessions(sessions.length);
      setAvgSessionMinutes(sessions.length ? Math.round(minutes / sessions.length) : 0);
      const byDay = new Map<string, number>();
      const byHour = new Map<number, number>();
      sessions.forEach((s) => {
        const d = new Date(s.created_at || s.started_at || new Date().toISOString());
        const day = format(d, "EEEE");
        byDay.set(day, (byDay.get(day) ?? 0) + Number(s.duration_seconds || 0));
        byHour.set(d.getHours(), (byHour.get(d.getHours()) ?? 0) + Number(s.duration_seconds || 0));
      });
      setBestDay([...byDay.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Tuesday");
      setBestHour(`${String([...byHour.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 9).padStart(2, "0")}:00`);

      const transformations = transformationsRes.data ?? [];
      setTransformCount(transformations.length);
      setInterests((interestsRes.data ?? []).map((i) => String(i.interest)));

      const snapshot: UserGamificationSnapshot = {
        id: user.id,
        xp: profile?.gamification?.xp ?? 0,
        level: profile?.gamification?.level ?? 1,
        streak: profile?.gamification?.streak ?? 1,
        longestStreak: profile?.gamification?.longest_streak ?? 1,
        totalSessions: sessions.length,
        totalTransformations: transformations.length,
        totalStudyMinutes: minutes,
        studiedDates: sessions.map((s) => String(s.created_at || s.started_at || new Date().toISOString())),
        studyHours: sessions.map((s) => new Date(String(s.created_at || s.started_at || new Date().toISOString())).getHours()),
        usedFormats: sessions.map((s) => String(s.content_format || "visual")),
        lastActiveDate: sessions[sessions.length - 1]?.created_at ?? null,
        achievements: (achievementsRes.data ?? []).map((a) => String(a.achievement_type))
      };
      const newAchievements = gamificationEngine.checkAchievements(snapshot);
      const allIds = [
        "first_steps",
        "streak_starter",
        "streak_master",
        "focus_king",
        "content_creator",
        "night_owl",
        "early_bird",
        "perfect_week",
        "marathon",
        "variety"
      ];
      const descriptions: Record<string, string> = {
        first_steps: "Complete first session",
        streak_starter: "3-day streak",
        streak_master: "7-day streak",
        focus_king: "10 hours total",
        content_creator: "5 transformations",
        night_owl: "Study after 10 PM",
        early_bird: "Study before 7 AM",
        perfect_week: "Study every day for a week",
        marathon: "2-hour session",
        variety: "Use all 4 content formats"
      };
      const titleMap: Record<string, string> = {
        first_steps: "First Steps",
        streak_starter: "Streak Starter",
        streak_master: "Streak Master",
        focus_king: "Focus King",
        content_creator: "Content Creator",
        night_owl: "Night Owl",
        early_bird: "Early Bird",
        perfect_week: "Perfect Week",
        marathon: "Marathon",
        variety: "Variety"
      };
      const unlocked = new Set(snapshot.achievements.concat(newAchievements));
      setAchievements(
        allIds.map((id) => ({
          id,
          title: titleMap[id],
          description: descriptions[id],
          unlocked: unlocked.has(id),
          progress: unlocked.has(id) ? 100 : Math.min(95, Math.round(Math.random() * 80)),
          unlockedAt: unlocked.has(id) ? new Date().toISOString() : null,
          recent: newAchievements.includes(id)
        }))
      );
      if (newAchievements[0]) {
        setCelebration({ open: true, title: titleMap[newAchievements[0]] });
      }
      setLoading(false);
    };
    void load();
  }, [supabase]);

  const leaderboardRows = gamificationEngine.getLeaderboard(
    leaderboardType,
    Array.from({ length: 10 }).map((_, i) => ({
      id: i === 4 ? userId || "me" : `u-${i}`,
      name: i === 4 ? name : `Scholar ${i + 1}`,
      weeklyXp: 1800 - i * 120,
      monthlyXp: 5200 - i * 240,
      totalXp: 12000 - i * 420
    })),
    userId || undefined
  );

  const saveProfile = async () => {
    if (!supabase || !userId) return;
    await supabase
      .from("profiles")
      .update({
        full_name: name,
        cognitive_profile: {
          learning_style: learningStyle,
          attention_span_minutes: attentionSpan,
          peak_focus_hours: [peakFocusStart, peakFocusEnd]
        },
        preferences
      })
      .eq("id", userId);
    toast.success("Profile updated.");
  };

  const handleAvatarUpload = async (file: File) => {
    if (!supabase || !userId) return;
    const path = `${userId}/avatar-${Date.now()}.png`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
    toast.success("Avatar updated.");
  };

  const addInterest = async (value: string) => {
    const interest = value.trim().toLowerCase();
    if (!interest || interests.includes(interest)) return;
    setInterests((prev) => [interest, ...prev]);
    setInterestInput("");
    if (supabase && userId) {
      await supabase.from("user_interests").insert({ user_id: userId, interest });
    }
  };

  const removeInterest = async (interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest));
    if (supabase && userId) {
      await supabase.from("user_interests").delete().eq("user_id", userId).eq("interest", interest);
    }
  };

  const simulateXpGain = () => {
    const gain = 35;
    setXp((prev) => prev + gain);
    setFloatingXp(gain);
    setTimeout(() => setFloatingXp(null), 1200);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 xl:grid-cols-[40%_60%]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={avatarUrl || "https://placehold.co/128x128/png"}
                  alt="avatar"
                  className="h-24 w-24 rounded-full border border-white/20 object-cover"
                />
                <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-content-center rounded-full bg-cyan-400 text-black">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleAvatarUpload(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{name}</p>
                <p className="text-sm text-gray-300">{email}</p>
                <p className="text-xs text-gray-400">Member since {format(new Date(memberSince), "MMM yyyy")}</p>
                <div className="mt-2 h-2 rounded bg-white/10">
                  <div className="h-full rounded bg-cyan-400" style={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="inline-flex items-center gap-1 rounded-md border border-white/20 px-3 py-2 text-xs">
                <Pencil className="h-3 w-3" /> Edit Profile
              </button>
              <button onClick={saveProfile} className="inline-flex items-center gap-1 rounded-md bg-cyan-400 px-3 py-2 text-xs text-black">
                <Save className="h-3 w-3" /> Save
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Cognitive Profile</p>
            <label className="mt-2 block text-sm">
              Learning style
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
              >
                <option>Visual</option>
                <option>Narrative</option>
                <option>Interactive</option>
                <option>Logical</option>
              </select>
            </label>
            <label className="mt-2 block text-sm">
              Attention span (minutes)
              <input
                type="number"
                value={attentionSpan}
                onChange={(e) => setAttentionSpan(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
              />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <label>
                Peak start
                <input
                  type="time"
                  value={peakFocusStart}
                  onChange={(e) => setPeakFocusStart(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                />
              </label>
              <label>
                Peak end
                <input
                  type="time"
                  value={peakFocusEnd}
                  onChange={(e) => setPeakFocusEnd(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                />
              </label>
            </div>
            <button className="mt-3 rounded-md border border-white/20 px-3 py-2 text-xs">Retake Assessment</button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Interest Manager</p>
            <p className="text-xs text-gray-400">These interests help us personalize your content.</p>
            <div className="mt-2 flex gap-2">
              <input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                className="flex-1 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
                placeholder="Add interest"
              />
              <button onClick={() => void addInterest(interestInput)} className="rounded-md bg-cyan-400 px-3 py-2 text-black">
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => void removeInterest(interest)}
                  className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-xs"
                >
                  {interest} ×
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {suggestionInterests.map((s) => (
                <button
                  key={s}
                  onClick={() => void addInterest(s)}
                  className="rounded-full border border-white/20 px-2 py-1 text-[11px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <XpProgress xp={xp} level={level} />
            {floatingXp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -30 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute right-6 top-8 text-emerald-300"
              >
                +{floatingXp} XP
              </motion.div>
            )}
            <button onClick={simulateXpGain} className="mt-2 rounded-md border border-white/20 px-3 py-1 text-xs">
              Simulate XP gain
            </button>
          </div>

          <AchievementGrid achievements={achievements} />

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Study Stats</p>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <p>Total sessions completed: {totalSessions}</p>
              <p>
                Total time studied: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </p>
              <p>Average session length: {avgSessionMinutes} min</p>
              <p>Best day for studying: {bestDay}</p>
              <p>Most productive hour: {bestHour}</p>
              <p className="inline-flex items-center gap-1">
                Current streak: {streak} days{" "}
                <Flame className={`h-4 w-4 ${streak > 3 ? "animate-pulse text-rose-300" : "text-gray-400"}`} />
              </p>
              <p>Longest streak: {longestStreak} days</p>
              <p>Transformations used: {transformCount}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-lg font-semibold">Preferences</p>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <label>
                Theme
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences((p) => ({ ...p, theme: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
              <label>
                Break reminder interval
                <input
                  type="number"
                  value={preferences.break_interval}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, break_interval: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                />
              </label>
              <label>
                Default session length
                <input
                  type="number"
                  value={preferences.default_session_length}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, default_session_length: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                />
              </label>
              <label>
                Default content format
                <select
                  value={preferences.default_content_format}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, default_content_format: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                >
                  <option>story</option>
                  <option>visual</option>
                  <option>challenge</option>
                  <option>interactive</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, notifications: e.target.checked }))
                  }
                />
                Notifications
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.sound_effects}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, sound_effects: e.target.checked }))
                  }
                />
                Sound effects
              </label>
              <label>
                Language
                <input
                  value={preferences.language}
                  onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2"
                />
              </label>
            </div>
          </section>

          <Leaderboard rows={leaderboardRows} type={leaderboardType} onChangeType={setLeaderboardType} />
        </div>
      </div>
      <AchievementCelebration
        open={celebration.open}
        title={celebration.title}
        onClose={() => setCelebration({ open: false, title: "" })}
      />
    </DashboardLayout>
  );
}
