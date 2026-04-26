import { useEffect, useMemo, useState } from "react";
import {
  emotionDetectionService,
  type ScrollBehaviorInput,
  type TypingPatternInput
} from "@/lib/ai/emotion";

type Props = {
  text: string;
  typing: TypingPatternInput;
  scroll: ScrollBehaviorInput;
  sessionDuration: number;
};

export function useMoodDetection({ text, typing, scroll, sessionDuration }: Props) {
  const [confidence, setConfidence] = useState(0.5);
  const [moodLabel, setMoodLabel] = useState("neutral");
  const [intervention, setIntervention] = useState<{
    intervene: boolean;
    type: "break" | "encouragement" | "format_change" | "challenge" | "none";
    urgency: "low" | "medium" | "high";
  }>({ intervene: false, type: "none", urgency: "low" });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const textResult = await emotionDetectionService.detectFromText(text);
      const typingResult = emotionDetectionService.analyzeTypingPattern(typing);
      const scrollResult = emotionDetectionService.analyzeScrollBehavior(scroll);
      const combined = emotionDetectionService.combineSignals(
        textResult.simplified,
        typingResult,
        scrollResult
      );
      const nextIntervention = emotionDetectionService.shouldIntervene(
        { dominantEmotion: combined.dominantEmotion, score: combined.score },
        sessionDuration
      );
      if (!cancelled) {
        setMoodLabel(combined.dominantEmotion);
        setConfidence(combined.score);
        setIntervention(nextIntervention);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [text, typing, scroll, sessionDuration]);

  return useMemo(
    () => ({
      moodLabel,
      confidence,
      intervention
    }),
    [moodLabel, confidence, intervention]
  );
}
