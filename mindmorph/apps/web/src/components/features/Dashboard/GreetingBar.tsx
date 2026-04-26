"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Props = {
  name: string;
};

export function GreetingBar({ name }: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? `Good morning, ${name}! Ready to crush it? ☀️`
      : hour < 18
        ? `Good afternoon, ${name}! Keep the momentum going! 🚀`
        : `Good evening, ${name}! Night owl mode activated 🌙`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-fuchsia-500/15 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-300">{format(new Date(), "EEEE, MMMM do")}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{greeting}</h1>
        </div>
        <div className="rounded-full border border-white/20 bg-white/5 p-3">
          <Sparkles className="h-5 w-5 text-cyan-300" />
        </div>
      </div>
    </motion.section>
  );
}
