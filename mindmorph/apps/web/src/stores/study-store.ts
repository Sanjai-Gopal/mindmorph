import { create } from "zustand";

type StudyState = {
  topic: string;
  subject: string;
  notesOpen: boolean;
  notes: string;
  isRunning: boolean;
  isBreak: boolean;
  selectedFormat: "visual" | "story" | "challenge" | "interactive";
  originalContent: string;
  morphedContent: string;
  showMorphed: boolean;
  sessionSeconds: number;
  timeRemaining: number;
  studyDuration: number;
  breakDuration: number;
  engagementScore: number;
  focusQuality: number;
  totalStudiedSeconds: number;
  transformedUsed: boolean;
  streakDays: number;
  achievements: string[];
  setTopic: (topic: string) => void;
  setSubject: (subject: string) => void;
  setNotesOpen: (open: boolean) => void;
  setNotes: (notes: string) => void;
  setRunning: (isRunning: boolean) => void;
  setBreak: (isBreak: boolean) => void;
  setFormat: (format: StudyState["selectedFormat"]) => void;
  setOriginalContent: (content: string) => void;
  setMorphedContent: (content: string) => void;
  setShowMorphed: (show: boolean) => void;
  setSessionSeconds: (seconds: number) => void;
  setTimeRemaining: (seconds: number) => void;
  setStudyDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setEngagementScore: (score: number) => void;
  setFocusQuality: (score: number) => void;
  setTotalStudiedSeconds: (seconds: number) => void;
  setStreakDays: (days: number) => void;
  markTransformationUsed: () => void;
  unlockAchievement: (id: string) => void;
  resetSession: () => void;
};

export const useStudyStore = create<StudyState>((set) => ({
  topic: "",
  subject: "",
  notesOpen: false,
  notes: "",
  isRunning: false,
  isBreak: false,
  selectedFormat: "visual",
  originalContent:
    "Paste or write your study material here. Use ## headers, code blocks, and math inline like E = mc^2.",
  morphedContent: "",
  showMorphed: false,
  sessionSeconds: 0,
  timeRemaining: 25 * 60,
  studyDuration: 25,
  breakDuration: 5,
  engagementScore: 72,
  focusQuality: 68,
  totalStudiedSeconds: 0,
  transformedUsed: false,
  streakDays: 1,
  achievements: [],
  setTopic: (topic) => set({ topic }),
  setSubject: (subject) => set({ subject }),
  setNotesOpen: (notesOpen) => set({ notesOpen }),
  setNotes: (notes) => set({ notes }),
  setRunning: (isRunning) => set({ isRunning }),
  setBreak: (isBreak) => set({ isBreak }),
  setFormat: (selectedFormat) => set({ selectedFormat }),
  setOriginalContent: (originalContent) => set({ originalContent }),
  setMorphedContent: (morphedContent) => set({ morphedContent }),
  setShowMorphed: (showMorphed) => set({ showMorphed }),
  setSessionSeconds: (sessionSeconds) => set({ sessionSeconds }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setStudyDuration: (studyDuration) =>
    set((state) => ({
      studyDuration,
      timeRemaining: state.isBreak ? state.timeRemaining : studyDuration * 60
    })),
  setBreakDuration: (breakDuration) =>
    set((state) => ({
      breakDuration,
      timeRemaining: state.isBreak ? breakDuration * 60 : state.timeRemaining
    })),
  setEngagementScore: (engagementScore) => set({ engagementScore }),
  setFocusQuality: (focusQuality) => set({ focusQuality }),
  setTotalStudiedSeconds: (totalStudiedSeconds) => set({ totalStudiedSeconds }),
  setStreakDays: (streakDays) => set({ streakDays }),
  markTransformationUsed: () => set({ transformedUsed: true }),
  unlockAchievement: (id) =>
    set((state) =>
      state.achievements.includes(id) ? state : { achievements: [...state.achievements, id] }
    ),
  resetSession: () =>
    set((state) => ({
      isRunning: false,
      isBreak: false,
      sessionSeconds: 0,
      timeRemaining: state.studyDuration * 60
    }))
}));
