"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  ChartLine,
  Coffee,
  Gamepad2,
  HeartPulse,
  Sparkles,
  Telescope
} from "lucide-react";

type StatProps = { label: string; target: number; suffix?: string };

function useInViewport<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function CountUpStat({ label, target, suffix = "" }: StatProps) {
  const { ref, isVisible } = useInViewport<HTMLDivElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now();
    const duration = 1200;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, target]);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-3xl font-extrabold text-cyan-300">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-gray-300">{label}</p>
    </div>
  );
}

const examples = [
  "Quantum Mechanics wave functions",
  "Organic Chemistry reactions",
  "Data Structures and Algorithms"
];

const testimonials = [
  { name: "Ishaan", school: "IIT Delhi", result: "Improved focus by 47% in 2 weeks" },
  { name: "Sofia", school: "UC Berkeley", result: "Turned abstract math into memorable stories" },
  { name: "Marcus", school: "University of Toronto", result: "Raised retention from 42% to 81%" }
];

export default function LandingBelowFold() {
  const [topic, setTopic] = useState(examples[0]);
  const [output, setOutput] = useState("Your transformed study format appears here.");
  const [loading, setLoading] = useState(false);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  const cards = useMemo(
    () => [
      {
        title: "Mood Detection",
        icon: HeartPulse,
        copy: "Adaptive interface changes with your emotional state"
      },
      {
        title: "Content Morphing",
        icon: Sparkles,
        copy: "Text to story, meme, challenge, or visual mode"
      },
      {
        title: "Focus Prediction",
        icon: Brain,
        copy: "AI predicts when your attention starts to drop"
      },
      {
        title: "Gamification",
        icon: Gamepad2,
        copy: "XP, streaks, and achievements to keep momentum"
      },
      { title: "Smart Breaks", icon: Coffee, copy: "Break timing optimized to your rhythm" },
      {
        title: "Progress Analytics",
        icon: ChartLine,
        copy: "Beautiful visuals of your learning trajectory"
      }
    ],
    []
  );

  const runDemo = async (preset?: string) => {
    const text = preset ?? topic;
    if (!text.trim()) return;
    setLoading(true);
    setTopic(text);
    const response = await fetch("/api/morph-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, format: "story" })
    });
    const data = await response.json();
    setOutput(data.transformed?.output ?? data.transformed ?? "Transformation complete.");
    setLoading(false);
  };

  return (
    <>
      <section id="problem" className="relative flex min-h-screen items-center px-6 py-16 md:px-12">
        <motion.div style={{ y: yParallax }} className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-6"
          >
            <motion.div
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="mx-auto h-56 w-56 rounded-full border border-white/30 bg-white/5 p-5"
            >
              <div className="flex h-full items-center justify-center text-7xl">😣</div>
            </motion.div>
            <p className="mt-4 text-center text-sm text-gray-200">Lottie-style frustrated student scene</p>
          </motion.div>

          <div className="space-y-5">
            {[
              "68% of students lose focus within 15 minutes of studying",
              "Complex topics feel impossible when you're not interested",
              "Traditional study methods ignore how YOUR brain works"
            ].map((line, idx) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: idx * 0.12 }}
                className="text-xl font-semibold md:text-3xl"
              >
                {line}
              </motion.p>
            ))}
            <div className="grid gap-3 pt-6 md:grid-cols-2">
              <CountUpStat label="students losing focus quickly" target={68} suffix="%" />
              <CountUpStat label="hours wasted in unproductive studying" target={10000} suffix="+" />
            </div>
          </div>
        </motion.div>
      </section>

      <section id="how-it-works" className="relative flex min-h-screen items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-center text-4xl font-extrabold">How It Works</h2>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            <svg className="pointer-events-none absolute left-0 top-10 hidden h-44 w-full md:block" viewBox="0 0 1200 200">
              <motion.path
                d="M180 100 C 350 10, 450 180, 620 100 S 900 20, 1040 100"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            {[
              ["We Understand You", "AI analyzes your behavior patterns"],
              ["We Transform Content", "Boring becomes engaging using your interests"],
              ["You Actually Learn", "Retention skyrockets with personalized format"]
            ].map(([title, copy]) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ rotateY: 10, rotateX: -6 }}
                viewport={{ once: true }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-xl font-bold">{title}</p>
                <p className="mt-2 text-gray-300">{copy}</p>
                <p className="mt-5 text-sm text-cyan-300 opacity-70 group-hover:opacity-100">
                  Hover to preview before/after morphing
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mt-10 rounded-2xl border border-white/10 bg-black/40 p-6"
          >
            <p className="mb-2 text-sm text-cyan-300">Interactive demo</p>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3"
              placeholder="Type a boring topic"
            />
          </motion.div>
        </div>
      </section>

      <section id="demo" className="relative flex min-h-screen items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-center text-4xl font-extrabold">Try the Morph Engine</h2>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3"
              placeholder="Paste something boring you need to study..."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() => runDemo(example)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-cyan-300"
                >
                  {example}
                </button>
              ))}
            </div>
            <button
              onClick={() => runDemo()}
              className="mt-4 rounded-full bg-cyan-400 px-5 py-2 font-semibold text-black"
            >
              {loading ? "Transforming..." : "Transform with AI"}
            </button>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <motion.div layout className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-gray-400">Original</p>
                <p className="mt-2 text-gray-200">{topic}</p>
              </motion.div>
              <motion.div layout className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4">
                <p className="text-xs text-cyan-300">Transformed</p>
                <motion.p key={output} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                  {output}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative flex min-h-screen items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-center text-4xl font-extrabold">Built for Real Learning Momentum</h2>
          <div className="mt-10 grid auto-rows-[180px] gap-4 md:grid-cols-3">
            {cards.map((card, idx) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ rotateX: 6, rotateY: -6, scale: 1.02 }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] ${
                  idx === 0 || idx === 5 ? "md:row-span-2" : ""
                }`}
              >
                <card.icon className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 text-xl font-semibold">{card.title}</p>
                <p className="mt-2 text-sm text-gray-300">{card.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-center text-4xl font-extrabold">Student Wins</h2>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="mt-10 flex w-[200%] gap-4 [perspective:1000px]"
          >
            {[...testimonials, ...testimonials].map((item, idx) => (
              <article
                key={`${item.name}-${idx}`}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:w-1/4"
                style={{ transform: "rotateY(-8deg) translateZ(0)" }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.school}</p>
                  </div>
                </div>
                <p className="text-cyan-300">{item.result}</p>
              </article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center px-6 py-16 md:px-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl bg-gradient-to-r from-indigo-600/60 to-fuchsia-600/60 p-10 text-center">
          <h2 className="text-4xl font-extrabold">Ready to fall in love with learning again?</h2>
          <p className="mt-3 text-gray-100">No credit card required. Free forever tier.</p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0.2)", "0 0 25px rgba(34,211,238,0.6)", "0 0 0 rgba(34,211,238,0.2)"] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mt-6 inline-flex rounded-full bg-white px-7 py-3 font-bold text-black"
          >
            Start Learning Free
          </motion.a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-300 md:flex-row">
          <p>Built with ❤️ for students who deserve better</p>
          <div className="flex items-center gap-5">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <Telescope className="h-4 w-4 text-cyan-300" />
          </div>
        </div>
      </footer>
    </>
  );
}
