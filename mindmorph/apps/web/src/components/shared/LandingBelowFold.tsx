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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 backdrop-blur-sm shadow-lg hover:border-blue-400/30 hover:shadow-blue-500/10"
    >
      <motion.p 
        className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {value.toLocaleString()}
        {suffix}
      </motion.p>
      <p className="mt-1 text-sm font-medium text-blue-200">{label}</p>
    </motion.div>
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
    try {
      const response = await fetch("/api/morph-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, format: "simple" })
      });
      const data = await response.json();
      if (!response.ok) {
        setOutput(typeof data.error === "string" ? data.error : "Could not transform this topic right now.");
        return;
      }
      setOutput(data.transformed ?? "Transformation complete.");
    } catch {
      setOutput("Network issue while running the demo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="problem" className="relative flex min-h-[70vh] items-center px-6 py-12 md:px-12">
        <motion.div style={{ y: yParallax }} className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-teal-500/10 p-6 shadow-2xl backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                rotate: [0, -3, 3, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-auto h-56 w-56 rounded-full border border-white/30 bg-gradient-to-br from-blue-400/20 to-purple-400/10 p-5 shadow-lg"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex h-full items-center justify-center text-7xl"
              >
                😣
              </motion.div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center text-sm font-medium text-blue-200"
            >
              Struggling student? We get it.
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent md:text-4xl"
            >
              The Learning Struggle Is Real
            </motion.h2>
            {[
              { text: "68% of students lose focus within 15 minutes of studying", icon: "⏱️" },
              { text: "Complex topics feel impossible when you're not interested", icon: "🤯" },
              { text: "Traditional study methods ignore how YOUR brain works", icon: "🧠" }
            ].map((item, idx) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 5,
                  transition: { type: "spring", stiffness: 400 }
                }}
                className="group rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-4 backdrop-blur-sm hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start gap-3">
                  <motion.span 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: idx * 0.2,
                      ease: "easeInOut"
                    }}
                    className="text-2xl"
                  >
                    {item.icon}
                  </motion.span>
                  <p className="text-lg font-medium text-gray-100 group-hover:text-blue-200 md:text-xl">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="grid gap-4 pt-8 md:grid-cols-2"
            >
              <CountUpStat label="students losing focus quickly" target={68} suffix="%" />
              <CountUpStat label="hours wasted in unproductive studying" target={10000} suffix="+" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="how-it-works" className="relative flex min-h-[70vh] items-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent md:text-5xl"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 text-center text-lg text-gray-300 md:text-xl"
          >
            Three simple steps to transform your learning experience
          </motion.p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <svg className="pointer-events-none absolute left-0 top-10 hidden h-44 w-full md:block" viewBox="0 0 1200 200">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <motion.path
                d="M180 100 C 350 10, 450 180, 620 100 S 900 20, 1040 100"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>

            {[
              {
                title: "We Understand You", 
                copy: "AI analyzes your behavior patterns", 
                icon: "🧠",
                color: "from-blue-500/20 to-purple-500/10",
                borderColor: "border-blue-400/30"
              },
              { 
                title: "We Transform Content", 
                copy: "Boring becomes engaging using your interests",
                icon: "✨", 
                color: "from-purple-500/20 to-pink-500/10",
                borderColor: "border-purple-400/30"
              },
              { 
                title: "You Actually Learn", 
                copy: "Retention skyrockets with personalized format",
                icon: "🚀",
                color: "from-teal-500/20 to-blue-500/10", 
                borderColor: "border-teal-400/30"
              }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ 
                  rotateY: 10, 
                  rotateX: -6, 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${step.color} p-6 backdrop-blur-sm shadow-lg hover:${step.borderColor} hover:shadow-xl transition-all duration-300`}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: idx * 0.3,
                    ease: "easeInOut"
                  }}
                >
                  {step.icon}
                </motion.div>
                <p className="text-xl font-bold text-white group-hover:text-blue-200">{step.title}</p>
                <p className="mt-2 text-gray-300 group-hover:text-gray-200">{step.copy}</p>
                <motion.p 
                  className="mt-5 text-sm text-blue-300 opacity-70 group-hover:opacity-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Hover to see the magic ✨
                </motion.p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-4"
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

      <section id="demo" className="relative flex min-h-[70vh] items-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent md:text-5xl"
          >
            Try the Morph Engine
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 text-center text-lg text-gray-600 md:text-xl"
          >
            Transform boring topics into engaging learning experiences
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-3xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-sm shadow-xl"
          >
            <motion.input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              whileFocus={{ 
                scale: 1.02,
                borderColor: "rgb(59 130 246 / 0.5)",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full rounded-lg border border-gray-300/50 bg-white/90 px-4 py-3 text-gray-800 placeholder-gray-500 transition-all duration-300 focus:border-blue-400/50 focus:outline-none focus:bg-white"
              placeholder="Paste something boring you need to study..."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example, idx) => (
                <motion.button
                  key={example}
                  onClick={() => runDemo(example)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: "rgb(59 130 246 / 0.5)",
                    backgroundColor: "rgb(59 130 246 / 0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-gray-300/50 bg-white/70 px-3 py-1 text-xs text-gray-600 transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-50 hover:text-blue-700"
                >
                  {example}
                </motion.button>
              ))}
            </div>
            <motion.button
              onClick={() => runDemo()}
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-green-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚡
                </motion.span>
              ) : (
                "Transform with AI"
              )}
            </motion.button>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <motion.div 
                layout 
                className="rounded-xl border border-gray-300/50 bg-white/90 p-4 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  borderColor: "rgb(59 130 246 / 0.3)"
                }}
              >
                <p className="text-xs font-medium text-gray-600">Original</p>
                <motion.p 
                  key={topic}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-gray-700"
                >
                  {topic}
                </motion.p>
              </motion.div>
              <motion.div 
                layout 
                className="rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-500/10 to-green-500/5 p-4 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  borderColor: "rgb(59 130 246 / 0.6)"
                }}
              >
                <p className="text-xs font-medium text-blue-600">Transformed</p>
                <motion.p 
                  key={output}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-gray-700"
                >
                  {output}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative flex min-h-[70vh] items-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent md:text-5xl"
          >
            Built for Real Learning Momentum
          </motion.h2>
          <div className="mt-8 grid auto-rows-[160px] gap-3 md:grid-cols-3">
            {cards.map((card, idx) => (
              <motion.article
                key={card.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                viewport={{ once: true, amount: 0.4 }}
                whileHover={{ rotateX: 6, rotateY: -6, scale: 1.02 }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className={`rounded-2xl border border-gray-200/50 bg-white/90 p-5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-blue-400/30 ${
                  idx === 0 || idx === 5 ? "md:row-span-2" : ""
                }`}
              >
                <card.icon className="h-6 w-6 text-blue-500" />
                <p className="mt-4 text-xl font-semibold text-gray-800">{card.title}</p>
                <p className="mt-2 text-sm text-gray-600">{card.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[60vh] items-center overflow-hidden px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent md:text-5xl"
          >
            Student Wins
          </motion.h2>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="mt-8 flex w-[200%] gap-3 [perspective:1000px]"
          >
            {[...testimonials, ...testimonials].map((item, idx) => (
              <article
                key={`${item.name}-${idx}`}
                className="w-full rounded-2xl border border-gray-200/50 bg-white/90 p-5 shadow-lg backdrop-blur-sm md:w-1/4"
                style={{ transform: "rotateY(-8deg) translateZ(0)" }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 font-bold text-white shadow-md">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.school}</p>
                  </div>
                </div>
                <p className="text-blue-600 font-medium">{item.result}</p>
              </article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative flex min-h-[50vh] items-center px-6 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl rounded-3xl bg-gradient-to-br from-blue-500/90 via-blue-600/80 to-green-500/90 p-10 text-center shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <motion.h2 
              className="text-4xl font-extrabold text-white md:text-5xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Ready to fall in love with learning again?
            </motion.h2>
            <p className="mt-3 text-blue-100 text-lg">No credit card required. Free forever tier.</p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              animate={{ boxShadow: ["0 0 0 rgba(255,255,255,0.2)", "0 0 25px rgba(255,255,255,0.6)", "0 0 0 rgba(255,255,255,0.2)"] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mt-6 inline-flex rounded-full bg-white px-8 py-4 font-bold text-blue-600 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              Start Learning Free
            </motion.a>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-600 md:flex-row">
          <p className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            Built with ❤️ for students who deserve better
          </p>
          <div className="flex items-center gap-5">
            <a href="#features" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Features</a>
            <a href="#demo" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Demo</a>
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Login</a>
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Register</a>
            <Telescope className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </footer>
    </>
  );
}
