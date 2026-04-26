"use client";

import { motion } from "framer-motion";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="grid min-h-[72vh] place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-fuchsia-500/15 p-8 text-center">
      <div className="max-w-2xl">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="mx-auto mb-6 grid h-20 w-20 place-content-center rounded-3xl border border-white/20 bg-black/20 text-3xl"
        >
          🧠
        </motion.div>
        <h1 className="text-3xl font-black md:text-5xl">Welcome to MindMorph!</h1>
        <p className="mt-3 text-lg text-gray-200">Let&apos;s understand how your brain learns best.</p>
        <p className="mt-2 text-sm text-gray-300">This takes 2 minutes and will completely change how you study.</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0.0)", "0 0 30px rgba(34,211,238,0.5)", "0 0 0 rgba(34,211,238,0.0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={onNext}
          className="mt-8 rounded-full bg-cyan-400 px-8 py-3 font-semibold text-black"
        >
          Next
        </motion.button>
      </div>
    </section>
  );
}
