"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FormatSelector } from "@/components/features/ContentMorpher/FormatSelector";
import type { TransformFormat } from "@/hooks/useContentTransform";

type Props = {
  input: string;
  subject: string;
  subjects: string[];
  format: TransformFormat;
  loading: boolean;
  examples: string[];
  onInputChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onFormatChange: (value: TransformFormat) => void;
  onTransform: () => void;
  onUseExample: (value: string) => void;
};

export function TransformInput(props: Props) {
  const {
    input,
    subject,
    subjects,
    format,
    loading,
    examples,
    onInputChange,
    onSubjectChange,
    onFormatChange,
    onTransform,
    onUseExample
  } = props;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const ta = textAreaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(460, ta.scrollHeight)}px`;
  }, [input]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h1 className="inline-flex items-center gap-2 text-2xl font-bold">
        Transform Boring into Brilliant <Sparkles className="h-5 w-5 text-cyan-300" />
      </h1>
      <p className="mt-1 text-sm text-gray-300">Paste your study material and choose your ideal learning style.</p>

      <textarea
        ref={textAreaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Paste your boring lecture notes, textbook paragraphs, or any study material..."
        className="mt-4 min-h-56 w-full resize-none rounded-xl border border-white/15 bg-black/20 p-4 font-mono text-sm leading-7 outline-none"
      />
      <div className="mt-1 text-right text-xs text-gray-400">{input.length.toLocaleString()} chars</div>

      <div className="mt-3">
        <input
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          list="subject-options"
          className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2"
        />
        <datalist id="subject-options">
          {subjects.map((subj) => (
            <option key={subj} value={subj} />
          ))}
        </datalist>
      </div>

      <div className="mt-4">
        <FormatSelector value={format} onChange={onFormatChange} />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={!input.trim() || loading}
        onClick={onTransform}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            AI is thinking
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black [animation-delay:240ms]" />
            </span>
          </span>
        ) : (
          "Transform"
        )}
      </motion.button>

      <div className="mt-6">
        <p className="mb-2 text-xs text-gray-400">Quick examples</p>
        <div className="grid gap-2">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => onUseExample(example)}
              className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-left text-sm hover:border-cyan-300"
            >
              Try: {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
