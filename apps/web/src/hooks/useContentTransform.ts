"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export type TransformFormat = "story" | "visual" | "challenge" | "analogy";

export type TransformRecord = {
  id: string;
  subject: string;
  format: TransformFormat;
  originalContent: string;
  transformedContent: string;
  qualityRating: number | null;
  createdAt: string;
};

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Economics",
  "Psychology"
];

export function useContentTransform() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [format, setFormat] = useState<TransformFormat>("story");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [engagementPrediction, setEngagementPrediction] = useState(0);
  const [saved, setSaved] = useState<TransformRecord[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [related, setRelated] = useState<TransformRecord[]>([]);

  const examples = useMemo(
    () => [
      "Quantum Computing basics",
      "World War II causes",
      "Photosynthesis process"
    ],
    []
  );

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const detectSubject = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes("algorithm") || lower.includes("data structure")) return "Computer Science";
      if (lower.includes("quantum") || lower.includes("force")) return "Physics";
      if (lower.includes("war") || lower.includes("revolution")) return "History";
      if (lower.includes("cell") || lower.includes("photosynthesis")) return "Biology";
      return SUBJECTS.find((s) => lower.includes(s.toLowerCase())) ?? subject;
    },
    [subject]
  );

  const loadSaved = useCallback(async () => {
    setSavedLoading(true);
    if (!supabase) {
      setSavedLoading(false);
      return;
    }
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setSavedLoading(false);
      return;
    }
    const { data } = await supabase
      .from("content_transformations")
      .select("id,subject,format,original_content,transformed_content,user_rating,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(16);
    setSaved(
      (data ?? []).map((item) => ({
        id: item.id as string,
        subject: (item.subject as string) || "General",
        format: (item.format as TransformFormat) || "story",
        originalContent: (item.original_content as string) || "",
        transformedContent: (item.transformed_content as string) || "",
        qualityRating: (item.user_rating as number | null) ?? null,
        createdAt: (item.created_at as string) || new Date().toISOString()
      }))
    );
    setSavedLoading(false);
  }, [supabase]);

  const loadInterests = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_interests")
      .select("interest")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setInterests((data ?? []).map((d) => String(d.interest)));
  }, [supabase]);

  useEffect(() => {
    void loadSaved();
    void loadInterests();
  }, [loadSaved, loadInterests]);

  useEffect(() => {
    if (!output || saved.length === 0) {
      setRelated([]);
      return;
    }
    setRelated(
      saved.filter((item) => item.subject === subject || item.format === format).slice(0, 3)
    );
  }, [saved, subject, format, output]);

  const postProcess = (text: string) => {
    return text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^/gm, (line) => (line.trim().length > 0 && !line.startsWith("#") ? "• " : ""))
      .slice(0, 9000);
  };

  const transform = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    const detectedSubject = detectSubject(input);
    setSubject(detectedSubject);
    try {
      const response = await fetch("/api/morph-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input,
          format: format === "challenge" ? "quiz" : "simple",
          subject: detectedSubject,
          interests
        })
      });
      const data = await response.json();
      const transformed = typeof data.transformed === "string" ? data.transformed : data.transformed?.output ?? "";
      const styled = postProcess(
        `${format === "analogy" ? "## Analogy Layer\n" : ""}${transformed}\n\n✨ Tailored using interests: ${
          interests.join(", ") || "none yet"
        }`
      );
      setOutput(styled);
      setEngagementPrediction(Math.min(96, Math.max(62, 70 + interests.length * 3)));
      toast.success("Transformation complete.");
    } catch {
      toast.error("Transformation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [input, detectSubject, format, interests]);

  const saveToLibrary = useCallback(async () => {
    if (!output.trim()) return;
    if (!supabase) {
      toast("Supabase not configured.");
      return;
    }
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      toast("Please sign in to save.");
      return;
    }
    await supabase.from("content_transformations").insert({
      user_id: user.id,
      original_content: input,
      transformed_content: output,
      format,
      subject,
      quality_score: engagementPrediction / 100
    });
    await loadSaved();
    toast.success("Saved to your library.");
  }, [output, supabase, input, format, subject, engagementPrediction, loadSaved]);

  const rateQuality = useCallback(
    async (value: number) => {
      const latest = saved[0];
      if (!latest || !supabase) return;
      await supabase.from("content_transformations").update({ user_rating: value }).eq("id", latest.id);
      setSaved((prev) => prev.map((item, idx) => (idx === 0 ? { ...item, qualityRating: value } : item)));
      toast.success("Rating saved.");
    },
    [saved, supabase]
  );

  const regenerate = useCallback(
    async (nextFormat?: TransformFormat) => {
      if (nextFormat) setFormat(nextFormat);
      await transform();
    },
    [transform]
  );

  const copyOutput = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard.");
  }, [output]);

  const addInterest = useCallback(async () => {
    const value = interestInput.trim().toLowerCase();
    if (!value || interests.includes(value)) return;
    setInterests((prev) => [value, ...prev]);
    setInterestInput("");
    if (!supabase) return;
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_interests").insert({ user_id: user.id, interest: value });
  }, [interestInput, interests, supabase]);

  const removeInterest = useCallback(
    async (value: string) => {
      setInterests((prev) => prev.filter((i) => i !== value));
      if (!supabase) return;
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("user_interests").delete().eq("user_id", user.id).eq("interest", value);
    },
    [supabase]
  );

  const deleteSaved = useCallback(
    async (id: string) => {
      if (!supabase) return;
      await supabase.from("content_transformations").delete().eq("id", id);
      setSaved((prev) => prev.filter((s) => s.id !== id));
    },
    [supabase]
  );

  const loadSavedItem = useCallback((item: TransformRecord) => {
    setInput(item.originalContent);
    setOutput(item.transformedContent);
    setFormat(item.format);
    setSubject(item.subject);
  }, []);

  const studyThis = useCallback(() => {
    router.push("/study");
  }, [router]);

  return {
    subjects: SUBJECTS,
    examples,
    input,
    setInput,
    subject,
    setSubject,
    format,
    setFormat,
    loading,
    output,
    saved,
    savedLoading,
    related,
    interests,
    interestInput,
    setInterestInput,
    engagementPrediction,
    transform,
    copyOutput,
    saveToLibrary,
    regenerate,
    rateQuality,
    addInterest,
    removeInterest,
    deleteSaved,
    loadSavedItem,
    studyThis
  };
}
