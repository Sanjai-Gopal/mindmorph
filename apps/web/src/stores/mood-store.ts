import { create } from "zustand";

type MoodState = {
  mood: string;
  setMood: (mood: string) => void;
};

export const useMoodStore = create<MoodState>((set) => ({
  mood: "neutral",
  setMood: (mood) => set({ mood })
}));
