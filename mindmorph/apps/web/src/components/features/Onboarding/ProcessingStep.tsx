"use client";

import { motion } from "framer-motion";

const facts = [
  "Learning with analogies improves recall by connecting new ideas to familiar ones.",
  "Short spaced sessions usually beat one long cram session.",
  "Emotion-aware studying improves consistency and retention."
];

export function ProcessingStep() {
  return (
    <section className="grid min-h-[70vh] place-items-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="max-w-xl">
        <h2 className="text-3xl font-black">Analyzing your responses...</h2>
        <div className="mx-auto mt-6 h-24 w-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="grid h-24 w-24 place-content-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-3xl"
          >
            🧠
          </motion.div>
        </div>
        <div className="mt-6 h-2 rounded bg-white/10">
          <motion.div
            className="h-full rounded bg-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
          />
        </div>
        <div className="mt-4 space-y-2 text-xs text-gray-300">
          {facts.map((fact) => (
            <p key={fact}>{fact}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
