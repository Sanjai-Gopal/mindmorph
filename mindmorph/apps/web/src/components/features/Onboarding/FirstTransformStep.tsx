"use client";

import Link from "next/link";
import type { LearningStyle } from "@/hooks/useOnboarding";

export function FirstTransformStep({ dominantStyle }: { dominantStyle: LearningStyle }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-black">First Transformation</h2>
      <p className="mt-2 text-sm text-gray-300">This is what studying will look like for you.</p>
      <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-4">
        <p className="text-xs text-cyan-200">Input</p>
        <p className="text-sm">Quantum mechanics wave functions</p>
        <p className="mt-3 text-xs text-cyan-200">Transformed ({dominantStyle})</p>
        <p className="text-sm text-gray-100">
          Think of a wave function like a probability weather-map for particles: instead of one exact spot,
          it tells us where a particle is more likely to show up.
        </p>
      </div>
      <Link href="/study" className="mt-5 inline-block rounded-md bg-cyan-400 px-4 py-2 font-semibold text-black">
        Let&apos;s go!
      </Link>
    </section>
  );
}
