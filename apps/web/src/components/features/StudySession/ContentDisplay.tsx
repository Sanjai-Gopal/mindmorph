"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookmarkPlus,
  FileCode2,
  Highlighter,
  Sparkles,
  StickyNote,
  Volume2
} from "lucide-react";

type Props = {
  originalContent: string;
  morphedContent: string;
  showMorphed: boolean;
  selectedFormat: "visual" | "story" | "challenge" | "interactive";
  engagementScore: number;
  onToggleMorphed: (show: boolean) => void;
  onTransform: () => void;
  onSelectFormat: (format: Props["selectedFormat"]) => void;
  onToggleNotes: () => void;
  onContentChange: (content: string) => void;
};

const formats: Props["selectedFormat"][] = ["visual", "story", "challenge", "interactive"];

export function ContentDisplay(props: Props) {
  const {
    originalContent,
    morphedContent,
    showMorphed,
    selectedFormat,
    engagementScore,
    onToggleMorphed,
    onTransform,
    onSelectFormat,
    onToggleNotes,
    onContentChange
  } = props;
  const [bookmarked, setBookmarked] = useState(false);
  const aiSuggestion = engagementScore < 40;

  const displayed = useMemo(
    () => (showMorphed && morphedContent ? morphedContent : originalContent),
    [showMorphed, morphedContent, originalContent]
  );

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(displayed);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleMorphed(false)}
            className={`rounded-full px-3 py-1 text-xs ${!showMorphed ? "bg-cyan-400 text-black" : "border border-white/20"}`}
          >
            Original
          </button>
          <button
            onClick={() => onToggleMorphed(true)}
            className={`rounded-full px-3 py-1 text-xs ${showMorphed ? "bg-cyan-400 text-black" : "border border-white/20"}`}
          >
            Morphed
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="rounded-md border border-white/20 p-2" title="Highlight text">
            <Highlighter className="h-4 w-4" />
          </button>
          <button className="rounded-md border border-white/20 p-2" title="Syntax mode">
            <FileCode2 className="h-4 w-4" />
          </button>
          <button className="rounded-md border border-white/20 p-2" onClick={onToggleNotes}>
            <StickyNote className="h-4 w-4" />
          </button>
          <button className="rounded-md border border-white/20 p-2" onClick={() => setBookmarked((b) => !b)}>
            <BookmarkPlus className={`h-4 w-4 ${bookmarked ? "text-cyan-300" : ""}`} />
          </button>
          <button className="rounded-md border border-white/20 p-2" onClick={speak}>
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => onSelectFormat(format)}
              className={`rounded-full px-3 py-1 text-xs capitalize ${
                selectedFormat === format ? "bg-indigo-400 text-black" : "border border-white/20"
              }`}
            >
              {format}
            </button>
          ))}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onTransform}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-fuchsia-500/90 px-3 py-1 text-xs font-semibold"
          >
            <Sparkles className="h-3 w-3" />
            Make this interesting
          </motion.button>
        </div>
        {aiSuggestion && (
          <p className="mt-2 inline-flex rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-300">
            AI suggestion: Engagement dipped. Try story mode.
          </p>
        )}
      </div>

      <div className="h-[calc(100%-160px)] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
        <textarea
          value={displayed}
          onChange={(e) => onContentChange(e.target.value)}
          className="h-full w-full resize-none bg-transparent font-mono text-sm leading-7 outline-none"
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">Math support: inline expressions like E = mc^2</p>
    </section>
  );
}
