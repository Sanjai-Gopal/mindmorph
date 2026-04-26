import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert educational psychologist and AI learning companion. You specialize in:
- Understanding student emotional states
- Transforming boring content into engaging formats
- Creating personalized learning experiences
- Using cognitive science principles for better retention
Always respond with structured JSON. Be encouraging and empathetic.`;

type JsonRecord = Record<string, unknown>;

export type EmotionalStateResult = {
  dominantEmotion: "frustrated" | "motivated" | "bored" | "overwhelmed" | "curious" | "focused" | "neutral";
  confidence: number;
  intensity: number;
  suggestions: string[];
};

export type LearningStyleResult = {
  primaryStyle: "VISUAL" | "NARRATIVE" | "INTERACTIVE" | "LOGICAL";
  secondaryStyle: "VISUAL" | "NARRATIVE" | "INTERACTIVE" | "LOGICAL";
  characteristics: string[];
  recommendedFormats: string[];
};

export type MorphContentInput = {
  originalContent: string;
  learningStyle: "VISUAL" | "NARRATIVE" | "INTERACTIVE" | "LOGICAL";
  userInterests: string[];
  emotionalState: string;
};

export type MorphContentResult = {
  transformedContent: string;
  format: string;
  metaphor: string;
  engagementPrediction: number;
};

export type MetaphorResult = {
  metaphor: string;
  explanation: string;
  analogyChain: string[];
};

export type FocusDropResult = {
  predictedDropInMinutes: number;
  confidence: number;
  suggestedIntervention: "break" | "format_change" | "challenge" | "micro_quiz";
};

export type StudyChallengeResult = {
  challenge: string;
  hints: string[];
  solution: string;
  xpReward: number;
};

export type PatternAnalysisResult = {
  peakHours: string[];
  procrastinationTriggers: string[];
  optimalSessionLength: number;
  recommendations: string[];
};

export class GeminiService {
  private readonly modelCandidates: string[];
  private readonly maxPerMinute = 10;
  private readonly maxRetries = 3;
  private readonly requestTimestamps: number[] = [];
  private readonly memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly cacheTtlMs = 10 * 60 * 1000;
  private readonly client: GoogleGenerativeAI | null;

  constructor(apiKey?: string) {
    const key =
      apiKey ??
      process.env.GEMINI_API_KEY ??
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ??
      "";
    this.modelCandidates = [
      process.env.GEMINI_MODEL,
      process.env.NEXT_PUBLIC_GEMINI_MODEL,
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest"
    ].filter((model): model is string => Boolean(model && model.trim()));
    this.client = key ? new GoogleGenerativeAI(key) : null;
  }

  async analyzeEmotionalState(text: string): Promise<EmotionalStateResult> {
    return this.callWithSchema<EmotionalStateResult>({
      task: "analyzeEmotionalState",
      payload: { text },
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          dominantEmotion: {
            type: SchemaType.STRING,
            enum: ["frustrated", "motivated", "bored", "overwhelmed", "curious", "focused", "neutral"]
          },
          confidence: { type: SchemaType.NUMBER },
          intensity: { type: SchemaType.NUMBER },
          suggestions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        required: ["dominantEmotion", "confidence", "intensity", "suggestions"]
      },
      userPrompt: `Analyze this student's emotional state from study text:\n${text}`,
      fallback: {
        dominantEmotion: "neutral",
        confidence: 0.45,
        intensity: 0.4,
        suggestions: ["Take a 2-minute reset breath and restate your goal."]
      }
    });
  }

  async determineLearningStyle(quizAnswers: object): Promise<LearningStyleResult> {
    return this.callWithSchema<LearningStyleResult>({
      task: "determineLearningStyle",
      payload: quizAnswers as JsonRecord,
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          primaryStyle: {
            type: SchemaType.STRING,
            enum: ["VISUAL", "NARRATIVE", "INTERACTIVE", "LOGICAL"]
          },
          secondaryStyle: {
            type: SchemaType.STRING,
            enum: ["VISUAL", "NARRATIVE", "INTERACTIVE", "LOGICAL"]
          },
          characteristics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          recommendedFormats: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["primaryStyle", "secondaryStyle", "characteristics", "recommendedFormats"]
      },
      userPrompt: `Given these onboarding quiz answers, infer best learning styles:\n${JSON.stringify(quizAnswers)}`,
      fallback: {
        primaryStyle: "LOGICAL",
        secondaryStyle: "VISUAL",
        characteristics: ["prefers structure", "likes clarity"],
        recommendedFormats: ["step-by-step maps", "progressive examples"]
      }
    });
  }

  async morphContent(input: MorphContentInput): Promise<MorphContentResult> {
    return this.callWithSchema<MorphContentResult>({
      task: "morphContent",
      payload: input,
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          transformedContent: { type: SchemaType.STRING },
          format: { type: SchemaType.STRING },
          metaphor: { type: SchemaType.STRING },
          engagementPrediction: { type: SchemaType.NUMBER }
        },
        required: ["transformedContent", "format", "metaphor", "engagementPrediction"]
      },
      userPrompt: `Transform this content using the specified style.
Style behavior:
- VISUAL: vivid mental imagery and text-described diagrams
- NARRATIVE: story with characters, plot, conflict, resolution
- INTERACTIVE: challenges, thought experiments, scenario prompts
- LOGICAL: first-principles reasoning and step-by-step breakdown
Input:\n${JSON.stringify(input)}`,
      fallback: {
        transformedContent: `Let's break this down simply: ${input.originalContent}`,
        format: `${input.learningStyle.toLowerCase()}-explanation`,
        metaphor: `${input.originalContent.slice(0, 40)}... is like training a muscle with deliberate reps.`,
        engagementPrediction: 0.65
      }
    });
  }

  async generateMetaphor(complexTopic: string, userInterest: string): Promise<MetaphorResult> {
    return this.callWithSchema<MetaphorResult>({
      task: "generateMetaphor",
      payload: { complexTopic, userInterest },
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          metaphor: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          analogyChain: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["metaphor", "explanation", "analogyChain"]
      },
      userPrompt: `Create multi-level analogy for topic "${complexTopic}" using interest "${userInterest}".`,
      fallback: {
        metaphor: `${complexTopic} is like mastering plays in ${userInterest}.`,
        explanation: "Both require pattern recognition, timing, and iterative refinement.",
        analogyChain: ["core concept -> familiar system", "interaction -> strategy", "outcome -> measurable result"]
      }
    });
  }

  async predictFocusDrop(sessionData: object): Promise<FocusDropResult> {
    return this.callWithSchema<FocusDropResult>({
      task: "predictFocusDrop",
      payload: sessionData as JsonRecord,
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          predictedDropInMinutes: { type: SchemaType.NUMBER },
          confidence: { type: SchemaType.NUMBER },
          suggestedIntervention: {
            type: SchemaType.STRING,
            enum: ["break", "format_change", "challenge", "micro_quiz"]
          }
        },
        required: ["predictedDropInMinutes", "confidence", "suggestedIntervention"]
      },
      userPrompt: `Predict focus drop timing from this session telemetry:\n${JSON.stringify(sessionData)}`,
      fallback: {
        predictedDropInMinutes: 14,
        confidence: 0.55,
        suggestedIntervention: "format_change"
      }
    });
  }

  async generateStudyChallenge(topic: string, difficulty: string): Promise<StudyChallengeResult> {
    return this.callWithSchema<StudyChallengeResult>({
      task: "generateStudyChallenge",
      payload: { topic, difficulty },
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          challenge: { type: SchemaType.STRING },
          hints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          solution: { type: SchemaType.STRING },
          xpReward: { type: SchemaType.NUMBER }
        },
        required: ["challenge", "hints", "solution", "xpReward"]
      },
      userPrompt: `Create gamified study challenge on "${topic}" at difficulty "${difficulty}".`,
      fallback: {
        challenge: `Explain "${topic}" in 3 bullet points and solve one application problem.`,
        hints: ["Define key terms first.", "Use one concrete example."],
        solution: "A concise model answer scaffold.",
        xpReward: difficulty === "hard" ? 120 : difficulty === "medium" ? 80 : 50
      }
    });
  }

  async analyzeUserPatterns(historyData: object): Promise<PatternAnalysisResult> {
    return this.callWithSchema<PatternAnalysisResult>({
      task: "analyzeUserPatterns",
      payload: historyData as JsonRecord,
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          peakHours: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          procrastinationTriggers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          optimalSessionLength: { type: SchemaType.NUMBER },
          recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["peakHours", "procrastinationTriggers", "optimalSessionLength", "recommendations"]
      },
      userPrompt: `Analyze 7-day learning history and provide optimization insights:\n${JSON.stringify(historyData)}`,
      fallback: {
        peakHours: ["09:00", "11:00", "15:00"],
        procrastinationTriggers: ["notification overload", "topic ambiguity"],
        optimalSessionLength: 25,
        recommendations: [
          "Start with a 3-minute warmup question.",
          "Use shorter sprints for high-friction topics."
        ]
      }
    });
  }

  private async callWithSchema<T>({
    task,
    payload,
    schema,
    userPrompt,
    fallback
  }: {
    task: string;
    payload: JsonRecord;
    schema: JsonRecord;
    userPrompt: string;
    fallback: T;
  }): Promise<T> {
    const cacheKey = `${task}:${JSON.stringify(payload)}`;
    const cached = this.getCached<T>(cacheKey);
    if (cached) return cached;

    if (!this.client) return this.setCacheAndReturn(cacheKey, fallback);

    const result = await this.retryWithBackoff(async () => {
      await this.waitForRateLimit();
      this.debugLog(task, payload);

      let lastError: unknown = null;
      for (const modelName of this.modelCandidates) {
        try {
          const model = this.client!.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });
          const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json",
              responseSchema: schema
            } as never
          });
          const text = response.response.text();
          return JSON.parse(text) as T;
        } catch (error) {
          lastError = error;
          this.debugLog("model_failed", { modelName, error: String(error) });
        }
      }
      throw lastError ?? new Error("No available Gemini model succeeded.");
    });

    return this.setCacheAndReturn(cacheKey, result ?? fallback);
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T | null> {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt += 1;
        if (attempt >= this.maxRetries) {
          this.debugLog("retry_failed", { error: String(error) });
          return null;
        }
        const delay = 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    return null;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    while (this.requestTimestamps.length && now - this.requestTimestamps[0] > 60_000) {
      this.requestTimestamps.shift();
    }
    if (this.requestTimestamps.length >= this.maxPerMinute) {
      const waitMs = 60_000 - (now - this.requestTimestamps[0]) + 10;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    this.requestTimestamps.push(Date.now());
  }

  private getCached<T>(key: string): T | null {
    const mem = this.memoryCache.get(key);
    if (mem && mem.expiresAt > Date.now()) return mem.value as T;

    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(`gemini_cache:${key}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
      if (parsed.expiresAt < Date.now()) {
        window.localStorage.removeItem(`gemini_cache:${key}`);
        return null;
      }
      this.memoryCache.set(key, { value: parsed.value as unknown, expiresAt: parsed.expiresAt });
      return parsed.value;
    } catch {
      return null;
    }
  }

  private setCacheAndReturn<T>(key: string, value: T): T {
    const expiresAt = Date.now() + this.cacheTtlMs;
    this.memoryCache.set(key, { value, expiresAt });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`gemini_cache:${key}`, JSON.stringify({ value, expiresAt }));
    }
    return value;
  }

  private debugLog(event: string, payload: unknown) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`[GeminiService] ${event}`, payload);
    }
  }
}

export const geminiService = new GeminiService();

export async function generateStudyHint(prompt: string) {
  const result = await geminiService.morphContent({
    originalContent: prompt,
    learningStyle: "LOGICAL",
    userInterests: [],
    emotionalState: "neutral"
  });
  return result.transformedContent;
}
