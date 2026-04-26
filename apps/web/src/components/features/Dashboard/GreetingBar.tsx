"use client";

import { format } from "date-fns";

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
    <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-4">
      <p className="text-sm text-gray-400">{format(new Date(), "EEEE, MMMM do")}</p>
      <h1 className="mt-1 text-2xl font-bold">{greeting}</h1>
    </section>
  );
}
