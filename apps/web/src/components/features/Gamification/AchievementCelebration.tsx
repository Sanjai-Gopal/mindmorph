"use client";

import { AnimatePresence, motion } from "framer-motion";

export function AchievementCelebration({
  open,
  title,
  onClose
}: {
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ y: -20, x: `${(i % 10) * 10}%`, opacity: 1 }}
                animate={{ y: "110vh", opacity: 0 }}
                transition={{ duration: 2.2 + (i % 5) * 0.2, repeat: Infinity, delay: (i % 8) * 0.08 }}
                className="absolute h-2 w-2 rounded-full bg-amber-300"
              />
            ))}
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-amber-300/40 bg-[#1a1306] p-6 text-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto mb-3 h-16 w-16 rounded-full bg-amber-300/20 text-4xl">
              🏆
            </motion.div>
            <p className="text-sm text-amber-300">Achievement Unlocked</p>
            <p className="mt-1 text-xl font-bold">{title}</p>
            <button onClick={onClose} className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm">
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
