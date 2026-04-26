"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type LearningStyle = "VISUAL" | "NARRATIVE" | "INTERACTIVE" | "LOGICAL";

export type OnboardingAnswers = {
  q1Style?: LearningStyle;
  q2Memory?: LearningStyle;
  q3Drop?: LearningStyle;
  interests: string[];
  productivityWindow: string;
  customStart?: string;
  customEnd?: string;
};

export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    interests: [],
    productivityWindow: "morning"
  });
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const styleScores = useMemo(() => {
    const base = { VISUAL: 0, NARRATIVE: 0, INTERACTIVE: 0, LOGICAL: 0 } as Record<LearningStyle, number>;
    if (answers.q1Style) base[answers.q1Style] += 2;
    if (answers.q2Memory) base[answers.q2Memory] += 2;
    if (answers.q3Drop) base[answers.q3Drop] += 1;
    const total = Object.values(base).reduce((a, b) => a + b, 0) || 1;
    const asPercent = (Object.entries(base) as Array<[LearningStyle, number]>).map(([style, value]) => ({
      style,
      value: Math.round((value / total) * 100)
    }));
    if (asPercent.every((entry) => entry.value === 0)) {
      return [
        { style: "VISUAL" as LearningStyle, value: 25 },
        { style: "NARRATIVE" as LearningStyle, value: 25 },
        { style: "INTERACTIVE" as LearningStyle, value: 25 },
        { style: "LOGICAL" as LearningStyle, value: 25 }
      ];
    }
    return asPercent;
  }, [answers]);

  const primaryStyle = useMemo(
    () => [...styleScores].sort((a, b) => b.value - a.value)[0]?.style ?? "NARRATIVE",
    [styleScores]
  );
  const secondaryStyle = useMemo(
    () => [...styleScores].sort((a, b) => b.value - a.value)[1]?.style ?? "VISUAL",
    [styleScores]
  );

  const next = () => setStep((prev) => Math.min(4, prev + 1));
  const back = () => setStep((prev) => Math.max(0, prev - 1));

  const save = async () => {
    if (!supabase) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const preferredHours =
      answers.productivityWindow === "custom"
        ? [answers.customStart || "09:00", answers.customEnd || "11:00"]
        : answers.productivityWindow === "morning"
          ? ["06:00", "12:00"]
          : answers.productivityWindow === "afternoon"
            ? ["12:00", "17:00"]
            : answers.productivityWindow === "evening"
              ? ["17:00", "22:00"]
              : ["22:00", "06:00"];

    await supabase
      .from("profiles")
      .update({
        onboarding_complete: true,
        cognitive_profile: {
          learning_style: primaryStyle,
          secondary_style: secondaryStyle,
          style_scores: styleScores,
          attention_span_minutes: 25,
          peak_focus_hours: preferredHours
        },
        gamification: {
          xp: 0,
          level: 1,
          streak: 1,
          longest_streak: 1
        }
      })
      .eq("id", user.id);

    await supabase.from("user_interests").delete().eq("user_id", user.id);
    if (answers.interests.length > 0) {
      await supabase.from("user_interests").insert(
        answers.interests.map((interest) => ({
          user_id: user.id,
          interest
        }))
      );
    }
  };

  const startProcessing = async () => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setProcessing(false);
    setStep(3);
  };

  return {
    step,
    setStep,
    next,
    back,
    processing,
    answers,
    setAnswers,
    styleScores,
    primaryStyle,
    secondaryStyle,
    save,
    startProcessing
  };
}
