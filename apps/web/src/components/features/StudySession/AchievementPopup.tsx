"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";

type Props = {
  achievement: string | null;
};

export function AchievementPopup({ achievement }: Props) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-amber-400/30 bg-[#1a1510] p-4 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Trophy className="h-4 w-4" /> Achievement unlocked
          </p>
          <p className="mt-1 text-sm text-gray-200">{achievement}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
