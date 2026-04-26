type EmotionCategory =
  | "frustrated"
  | "motivated"
  | "bored"
  | "overwhelmed"
  | "curious"
  | "focused"
  | "neutral";

export type TypingPatternInput = {
  speed: number;
  consistency: number;
  errorRate: number;
};

export type ScrollBehaviorInput = {
  scrollSpeed: number;
  pattern: "smooth" | "rapid" | "none" | "mixed";
  depth: number;
};

export type EmotionScores = {
  raw: Record<string, number>;
  simplified: Record<EmotionCategory, number>;
};

export class EmotionDetectionService {
  private readonly hfModel = "SamLowe/roberta-base-go_emotions";
  private readonly hfApiUrl = `https://api-inference.huggingface.co/models/${this.hfModel}`;
  private readonly cache = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly ttl = 5 * 60 * 1000;
  private readonly hfKey: string;

  constructor(apiKey?: string) {
    this.hfKey =
      apiKey ??
      process.env.HUGGINGFACE_API_KEY ??
      process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ??
      "";
  }

  async detectFromText(text: string): Promise<EmotionScores> {
    const cacheKey = `text:${text}`;
    const cached = this.getCached<EmotionScores>(cacheKey);
    if (cached) return cached;

    if (!this.hfKey) {
      return this.setCached(cacheKey, this.fallbackFromText(text));
    }

    try {
      const res = await fetch(this.hfApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.hfKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      });

      if (!res.ok) {
        throw new Error(`HuggingFace error: ${res.status}`);
      }

      const output = (await res.json()) as Array<Array<{ label: string; score: number }>>;
      const first = output[0] ?? [];
      const raw = Object.fromEntries(first.map((item) => [item.label.toLowerCase(), item.score]));
      const simplified = this.mapToSimplifiedCategories(raw);
      return this.setCached(cacheKey, { raw, simplified });
    } catch {
      return this.setCached(cacheKey, this.fallbackFromText(text));
    }
  }

  analyzeTypingPattern({ speed, consistency, errorRate }: TypingPatternInput): Record<EmotionCategory, number> {
    const base = this.blankScores();
    if (speed > 55 && consistency > 0.7 && errorRate < 0.08) base.focused = 0.8;
    if (speed < 25 && errorRate > 0.2) base.frustrated = 0.75;
    if (speed < 20 && consistency > 0.75) base.curious = 0.6;
    if (speed < 15 && consistency < 0.4) base.bored = 0.7;
    if (Object.values(base).every((v) => v === 0)) base.neutral = 0.5;
    return base;
  }

  analyzeScrollBehavior({
    scrollSpeed,
    pattern,
    depth
  }: ScrollBehaviorInput): Record<"engaged" | "searching" | "focused" | "distracted", number> {
    const indicators = { engaged: 0, searching: 0, focused: 0, distracted: 0 };
    if (pattern === "smooth") indicators.engaged = 0.8;
    if (pattern === "rapid" || scrollSpeed > 1200) indicators.searching = 0.75;
    if (pattern === "none" && depth > 0.4) indicators.focused = 0.7;
    if (pattern === "none" && depth < 0.2) indicators.distracted = 0.7;
    return indicators;
  }

  combineSignals(
    textEmotion: Record<EmotionCategory, number>,
    typingPattern: Record<EmotionCategory, number>,
    scrollBehavior: Record<"engaged" | "searching" | "focused" | "distracted", number>
  ): { dominantEmotion: EmotionCategory; score: number; blend: Record<EmotionCategory, number> } {
    const blend = this.blankScores();
    for (const key of Object.keys(blend) as EmotionCategory[]) {
      const textScore = textEmotion[key] ?? 0;
      const typingScore = typingPattern[key] ?? 0;
      const scrollScore = this.scrollToEmotion(key, scrollBehavior);
      blend[key] = textScore * 0.5 + typingScore * 0.3 + scrollScore * 0.2;
    }
    const dominantEmotion =
      (Object.entries(blend).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionCategory | undefined) ?? "neutral";
    return { dominantEmotion, score: blend[dominantEmotion] ?? 0, blend };
  }

  shouldIntervene(
    emotionalState: { dominantEmotion: EmotionCategory; score: number },
    sessionDuration: number
  ): { intervene: boolean; type: "break" | "encouragement" | "format_change" | "challenge" | "none"; urgency: "low" | "medium" | "high" } {
    const { dominantEmotion, score } = emotionalState;
    if ((dominantEmotion === "frustrated" || dominantEmotion === "overwhelmed") && score > 0.55) {
      return { intervene: true, type: "break", urgency: "high" };
    }
    if (dominantEmotion === "bored" && sessionDuration > 12) {
      return { intervene: true, type: "challenge", urgency: "medium" };
    }
    if (dominantEmotion === "focused" && sessionDuration > 35) {
      return { intervene: true, type: "encouragement", urgency: "low" };
    }
    if (dominantEmotion === "curious" && sessionDuration > 18) {
      return { intervene: true, type: "format_change", urgency: "low" };
    }
    return { intervene: false, type: "none", urgency: "low" };
  }

  private mapToSimplifiedCategories(raw: Record<string, number>): Record<EmotionCategory, number> {
    const map = this.blankScores();
    map.frustrated = (raw.anger ?? 0) * 0.5 + (raw.annoyance ?? 0) * 0.5;
    map.motivated = (raw.excitement ?? 0) * 0.5 + (raw.pride ?? 0) * 0.5;
    map.bored = raw.boredom ?? 0;
    map.overwhelmed = (raw.nervousness ?? 0) * 0.5 + (raw.fear ?? 0) * 0.5;
    map.curious = raw.curiosity ?? 0;
    map.focused = (raw.realization ?? 0) * 0.5 + (raw.neutral ?? 0) * 0.5;
    map.neutral = raw.neutral ?? 0.2;
    return map;
  }

  private blankScores(): Record<EmotionCategory, number> {
    return {
      frustrated: 0,
      motivated: 0,
      bored: 0,
      overwhelmed: 0,
      curious: 0,
      focused: 0,
      neutral: 0
    };
  }

  private fallbackFromText(text: string): EmotionScores {
    const lower = text.toLowerCase();
    const simplified = this.blankScores();
    if (lower.includes("overwhelmed") || lower.includes("stuck")) simplified.overwhelmed = 0.75;
    else if (lower.includes("excited") || lower.includes("ready")) simplified.motivated = 0.8;
    else if (lower.includes("bored")) simplified.bored = 0.75;
    else if (lower.includes("focus")) simplified.focused = 0.7;
    else simplified.neutral = 0.6;
    return { raw: { fallback: 1 }, simplified };
  }

  private scrollToEmotion(
    emotion: EmotionCategory,
    scroll: Record<"engaged" | "searching" | "focused" | "distracted", number>
  ) {
    if (emotion === "focused") return scroll.focused * 0.8 + scroll.engaged * 0.2;
    if (emotion === "bored") return scroll.searching * 0.7 + scroll.distracted * 0.3;
    if (emotion === "curious") return scroll.searching * 0.4 + scroll.engaged * 0.6;
    if (emotion === "frustrated") return scroll.searching * 0.5 + scroll.distracted * 0.5;
    if (emotion === "motivated") return scroll.engaged * 0.7;
    return 0.1;
  }

  private getCached<T>(key: string): T | null {
    const mem = this.cache.get(key);
    if (mem && mem.expiresAt > Date.now()) return mem.value as T;
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(`emotion_cache:${key}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
      if (parsed.expiresAt < Date.now()) {
        window.localStorage.removeItem(`emotion_cache:${key}`);
        return null;
      }
      this.cache.set(key, { value: parsed.value as unknown, expiresAt: parsed.expiresAt });
      return parsed.value;
    } catch {
      return null;
    }
  }

  private setCached<T>(key: string, value: T): T {
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, { value, expiresAt });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`emotion_cache:${key}`, JSON.stringify({ value, expiresAt }));
    }
    return value;
  }
}

export const emotionDetectionService = new EmotionDetectionService();

export function detectEmotionFromText(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("overwhelmed") || lower.includes("stuck")) return "frustrated";
  if (lower.includes("excited") || lower.includes("ready")) return "motivated";
  if (lower.includes("bored")) return "bored";
  if (lower.includes("focus")) return "focused";
  return "neutral";
}
