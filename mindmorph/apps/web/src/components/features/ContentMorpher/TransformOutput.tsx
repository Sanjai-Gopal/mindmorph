"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Library, RefreshCcw, Send, Star } from "lucide-react";
import type { TransformFormat, TransformRecord } from "@/hooks/useContentTransform";

type Props = {
  output: string;
  loading: boolean;
  format: TransformFormat;
  engagementPrediction: number;
  related: TransformRecord[];
  onCopy: () => void;
  onStudyThis: () => void;
  onSave: () => void;
  onRegenerate: (format?: TransformFormat) => void;
  onRate: (value: number) => void;
  onLoadRelated: (item: TransformRecord) => void;
};

function styleLabel(format: TransformFormat) {
  if (format === "story") return "Narrative";
  if (format === "visual") return "Visual";
  if (format === "challenge") return "Interactive Challenge";
  return "Analogy";
}

export function TransformOutput({
  output,
  loading,
  format,
  engagementPrediction,
  related,
  onCopy,
  onStudyThis,
  onSave,
  onRegenerate,
  onRate,
  onLoadRelated
}: Props) {
  const [revealed, setRevealed] = useState("");
  const [cursor, setCursor] = useState(0);
  const style = useMemo(() => styleLabel(format), [format]);

  useEffect(() => {
    setCursor(0);
    setRevealed("");
  }, [output]);

  useEffect(() => {
    if (!output || loading) return;
    if (cursor >= output.length) return;
    const timer = window.setTimeout(() => {
      const next = cursor + 8;
      setCursor(next);
      setRevealed(output.slice(0, next));
    }, 14);
    return () => window.clearTimeout(timer);
  }, [output, cursor, loading]);

  const rendered = loading ? "" : revealed || output;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Your Personalized Version</h2>
        <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs text-cyan-300">
          {style} Style
        </span>
      </div>

      <div className="mt-4 min-h-80 rounded-xl border border-white/10 bg-black/20 p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        ) : (
          <motion.pre
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-gray-100"
          >
            {rendered || "Your transformed output will appear here."}
          </motion.pre>
        )}
      </div>

      <div className="mt-3 inline-flex rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-300">
        AI predicts {engagementPrediction}% engagement with this format
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <button onClick={onCopy} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Copy className="h-3 w-3" /> Copy
          </span>
        </button>
        <button onClick={onStudyThis} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Send className="h-3 w-3" /> Study This
          </span>
        </button>
        <button onClick={onSave} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <Library className="h-3 w-3" /> Save
          </span>
        </button>
        <button onClick={() => onRegenerate()} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          <span className="inline-flex items-center gap-1">
            <RefreshCcw className="h-3 w-3" /> Regenerate
          </span>
        </button>
        <div className="flex items-center justify-center gap-1 rounded-lg border border-white/20 px-2 py-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} onClick={() => onRate(value)}>
              <Star className="h-3 w-3 text-amber-300" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-gray-400">Related transformations</p>
        <div className="grid gap-2">
          {related.length === 0 && <p className="text-xs text-gray-500">No similar items yet.</p>}
          {related.map((item) => (
            <button
              key={item.id}
              onClick={() => onLoadRelated(item)}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-xs hover:border-cyan-300"
            >
              {item.subject} · {item.format} · {new Date(item.createdAt).toLocaleDateString()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
