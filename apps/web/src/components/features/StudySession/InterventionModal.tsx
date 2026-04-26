"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Coffee, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onTransform: () => void;
};

export function InterventionModal({ open, onClose, onTransform }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-[#0b0c16] p-5"
          >
            <p className="text-lg font-semibold">Gentle nudge ✨</p>
            <p className="mt-2 text-sm text-gray-300">
              Engagement dipped for a few minutes. Want a quick reset?
            </p>
            <div className="mt-4 grid gap-2">
              <button
                onClick={onTransform}
                className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-500 px-3 py-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" /> Transform content
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm">
                <Coffee className="h-4 w-4" /> Take a 2-minute micro-break
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm">
                <Brain className="h-4 w-4" /> Quick focus challenge
              </button>
            </div>
            <button onClick={onClose} className="mt-4 w-full rounded-lg border border-white/20 py-2 text-sm">
              Continue studying
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
