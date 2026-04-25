"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const quotes = [
  "Small focused sessions beat marathon cramming.",
  "Every difficult topic becomes learnable in the right format.",
  "Progress compounds when consistency gets easier.",
  "Your brain is not the problem. The format is."
];

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
    }, 140);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07070f] px-6 text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
        className="grid h-20 w-20 place-content-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 text-2xl font-black"
      >
        M
      </motion.div>
      <p className="mt-6 text-lg font-semibold">MindMorph is tuning your study space...</p>
      <motion.p
        key={quote}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 max-w-lg text-center text-sm text-gray-300"
      >
        "{quote}"
      </motion.p>
      <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-300 to-fuchsia-400"
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
