"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

const LandingBelowFold = dynamic(() => import("@/components/shared/LandingBelowFold"), {
  ssr: false,
  loading: () => <div className="min-h-screen" />
});

export default function LandingPage() {
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 1.5
      })),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <main className="relative scroll-smooth overflow-hidden bg-[#07070f] text-white">
      <section className="relative flex min-h-screen items-center justify-center px-6 md:px-12">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(168,85,247,0.30), transparent 40%), radial-gradient(circle at 80% 25%, rgba(34,211,238,0.24), transparent 38%), radial-gradient(circle at 40% 80%, rgba(244,63,94,0.18), transparent 45%)"
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(34,211,238,0.22), transparent 24%)`
          }}
        />

        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute rounded-full bg-cyan-300/70"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              willChange: "transform"
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3 + p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <motion.div
          animate={{ rotate: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute left-[8%] top-[20%] hidden h-20 w-20 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 md:block"
          style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
        />
        <motion.div
          animate={{ rotate: [0, -9, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute right-[10%] top-[30%] hidden h-24 w-24 rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 md:block"
          style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black leading-tight md:text-7xl"
          >
            <span className="bg-[linear-gradient(120deg,#22d3ee,#a855f7,#f43f5e,#22d3ee)] bg-[length:300%_300%] bg-clip-text text-transparent [animation:gradient_8s_ease_infinite]">
              Your Brain Deserves Better Than Boring
            </span>
          </motion.h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-gray-200 md:text-xl">
            AI that understands when you&apos;re struggling and transforms complex topics into your
            language.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-3 font-bold text-black transition hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            >
              Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex rounded-full border border-white/30 px-7 py-3 font-semibold hover:border-cyan-300"
            >
              See How It Works
            </a>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-300"
        >
          <ArrowDown className="mx-auto h-5 w-5" />
          <p className="mt-1 text-xs">Scroll</p>
        </motion.div>
      </section>

      <LandingBelowFold />
      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </main>
  );
}
