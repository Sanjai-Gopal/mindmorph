"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, BrainCircuit, Rocket, ShieldCheck, Sparkles, Zap } from "lucide-react";

const LandingBelowFold = dynamic(() => import("@/components/shared/LandingBelowFold"), {
  ssr: false,
  loading: () => <div className="min-h-screen" />
});

export default function LandingPage() {
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  const [tagIndex, setTagIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const seeded = (seed: number) => {
    const x = Math.sin(seed * 999) * 10000;
    return x - Math.floor(x);
  };
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, idx) => ({
        id: idx,
        left: seeded(idx + 1) * 100,
        top: seeded(idx + 101) * 100,
        size: seeded(idx + 201) * 4 + 2,
        delay: seeded(idx + 301) * 1.5
      })),
    []
  );
  const quickTags = useMemo(
    () => ["Visual Memory Mode", "Story Morphing", "Quiz Sprint AI", "Mood Adaptive UI"],
    []
  );
  const trustStats = useMemo(
    () => [
      { label: "Beta learners", value: "12,400+" },
      { label: "Avg retention gain", value: "2.3x" },
      { label: "Daily focus sessions", value: "48k" }
    ],
    []
  );
  const infoCards = useMemo(
    () => [
      {
        icon: BrainCircuit,
        title: "Neuro-Adaptive Engine",
        copy: "Detects your learning rhythm and modifies complexity every minute."
      },
      {
        icon: ShieldCheck,
        title: "Private by Design",
        copy: "Study history is encrypted and never sold to third-party ad networks."
      },
      {
        icon: Rocket,
        title: "Exam Acceleration",
        copy: "Builds instant revision packs and high-yield practice loops before exams."
      }
    ],
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
  useEffect(() => {
    const timer = setInterval(() => {
      setTagIndex((prev) => (prev + 1) % quickTags.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [quickTags.length]);
  const onHeroCardMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 10,
      y: (px - 0.5) * 10
    });
  };
  const onHeroCardLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <main className="relative overflow-hidden bg-[#05060f] text-white">
      <section className="relative flex min-h-screen items-center justify-center px-6 md:px-12">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(168,85,247,0.24), transparent 40%), radial-gradient(circle at 80% 25%, rgba(34,211,238,0.18), transparent 38%), radial-gradient(circle at 40% 80%, rgba(244,63,94,0.14), transparent 45%)"
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(34,211,238,0.16), transparent 22%)`
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
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 md:block"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300/10 md:block"
        />

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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs text-cyan-200"
          >
            <Zap className="h-3.5 w-3.5" />
            Inspired by modern aurora + glass landing patterns
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black leading-tight md:text-7xl"
          >
            <span className="bg-[linear-gradient(120deg,#22d3ee,#a855f7,#f43f5e,#22d3ee)] bg-[length:300%_300%] bg-clip-text text-transparent [animation:gradient_8s_ease_infinite]">
              Learn In A Theme That Feels Alive
            </span>
          </motion.h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-gray-200 md:text-xl">
            MindMorph turns difficult chapters into dynamic learning experiences with adaptive visuals,
            format morphing, and real-time focus guidance.
          </p>
          <motion.div
            key={quickTags[tagIndex]}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100"
          >
            <Sparkles className="h-4 w-4" />
            Now highlighting: {quickTags[tagIndex]}
          </motion.div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group relative inline-flex rounded-full p-[1px]"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#22d3ee,#a855f7,#f43f5e,#22d3ee)] bg-[length:220%_220%] [animation:borderFlow_5s_linear_infinite] opacity-95 transition group-hover:opacity-100" />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[#08101e] px-7 py-3 font-bold text-cyan-100 transition group-hover:bg-[#0a1225]">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="group relative inline-flex rounded-full p-[1px]"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.55),rgba(34,211,238,0.6),rgba(168,85,247,0.65),rgba(255,255,255,0.55))] bg-[length:220%_220%] [animation:borderFlow_6s_linear_infinite]" />
              <span className="relative inline-flex rounded-full bg-[#090d18] px-7 py-3 font-semibold text-white/90 transition group-hover:bg-[#0b1020]">
                See How It Works
              </span>
            </a>
          </div>

          <motion.div
            onMouseMove={onHeroCardMove}
            onMouseLeave={onHeroCardLeave}
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 110, damping: 14, mass: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
            className="mt-10 grid gap-3 md:grid-cols-3"
          >
            {trustStats.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                style={{ transform: "translateZ(20px)" }}
              >
                <p className="text-2xl font-extrabold text-cyan-200">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-gray-300">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 pb-12 md:px-12">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {infoCards.map((card, idx) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-5 backdrop-blur-sm"
            >
              <card.icon className="h-6 w-6 text-cyan-200" />
              <h3 className="mt-4 text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{card.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative px-6 pb-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-fuchsia-300/20 bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/15 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Product timeline</p>
              <h3 className="mt-2 text-2xl font-extrabold">Built for long-term learning, not quick hacks</h3>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/20"
            >
              Join Early Access <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["Week 1", "Behavior baseline and attention map"],
              ["Week 2", "Adaptive content formats activated"],
              ["Week 3", "Retention loops and weak-topic rescue"],
              ["Week 4+", "Exam sprint mode with confidence scoring"]
            ].map(([phase, detail]) => (
              <div key={phase} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-bold text-cyan-200">{phase}</p>
                <p className="mt-1 text-sm text-gray-200">{detail}</p>
              </div>
            ))}
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

        @keyframes borderFlow {
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
