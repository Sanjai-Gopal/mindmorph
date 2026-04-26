"use client";

import { motion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";
import type { OnboardingAnswers } from "@/hooks/useOnboarding";

type Props = {
  questionIndex: number;
  answers: OnboardingAnswers;
  setAnswers: Dispatch<SetStateAction<OnboardingAnswers>>;
  onBack: () => void;
  onNext: () => void;
};

const interestOptions = ["Gaming", "Sports", "Anime", "Cooking", "Music", "Technology", "Space", "Nature", "History", "Art", "Movies", "Fitness"];

export function QuizStep({ questionIndex, answers, setAnswers, onBack, onNext }: Props) {
  const progress = ((questionIndex + 1) / 5) * 100;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6">
        <p className="text-xs text-gray-300">Step {questionIndex + 1}/5</p>
        <div className="mt-2 h-2 rounded bg-white/10">
          <motion.div className="h-full rounded bg-cyan-400" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      {questionIndex === 0 && (
        <QuestionCard
          title="When learning something new, you prefer:"
          options={[
            { id: "VISUAL", label: "🎨 Images, diagrams, and visual explanations" },
            { id: "NARRATIVE", label: "📖 Stories and real-world examples" },
            { id: "INTERACTIVE", label: "🎮 Hands-on practice and challenges" },
            { id: "LOGICAL", label: "📊 Step-by-step logical breakdowns" }
          ]}
          selected={answers.q1Style}
          onSelect={(value) => setAnswers((prev) => ({ ...prev, q1Style: value as OnboardingAnswers["q1Style"] }))}
        />
      )}

      {questionIndex === 1 && (
        <QuestionCard
          title="You remember information best when:"
          options={[
            { id: "NARRATIVE", label: "It is presented as a story or analogy" },
            { id: "VISUAL", label: "You can see it visually mapped out" },
            { id: "INTERACTIVE", label: "You test yourself with questions" },
            { id: "LOGICAL", label: "It follows a clear logical structure" }
          ]}
          selected={answers.q2Memory}
          onSelect={(value) => setAnswers((prev) => ({ ...prev, q2Memory: value as OnboardingAnswers["q2Memory"] }))}
        />
      )}

      {questionIndex === 2 && (
        <QuestionCard
          title="What makes you lose interest fastest?"
          options={[
            { id: "VISUAL", label: "Too much text without visuals" },
            { id: "NARRATIVE", label: "Abstract concepts without examples" },
            { id: "INTERACTIVE", label: "Just reading without doing anything" },
            { id: "LOGICAL", label: "Disorganized, non-sequential information" }
          ]}
          selected={answers.q3Drop}
          onSelect={(value) => setAnswers((prev) => ({ ...prev, q3Drop: value as OnboardingAnswers["q3Drop"] }))}
        />
      )}

      {questionIndex === 3 && (
        <div>
          <h2 className="text-xl font-bold">What are you interested in?</h2>
          <p className="text-sm text-gray-300">Select multiple tags or add your own.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const selected = answers.interests.includes(interest.toLowerCase());
              return (
                <button
                  key={interest}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      interests: selected
                        ? prev.interests.filter((value) => value !== interest.toLowerCase())
                        : [...prev.interests, interest.toLowerCase()]
                    }))
                  }
                  className={`rounded-full border px-3 py-1 text-sm ${selected ? "border-cyan-300 bg-cyan-400/20" : "border-white/20"}`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {questionIndex === 4 && (
        <div>
          <h2 className="text-xl font-bold">When do you feel most productive?</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {[
              ["morning", "Morning (6am-12pm)"],
              ["afternoon", "Afternoon (12pm-5pm)"],
              ["evening", "Evening (5pm-10pm)"],
              ["night", "Night (10pm-6am)"],
              ["custom", "Select specific hours"]
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setAnswers((prev) => ({ ...prev, productivityWindow: id }))}
                className={`rounded-xl border p-3 text-left text-sm ${answers.productivityWindow === id ? "border-cyan-300 bg-cyan-400/15" : "border-white/15"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {answers.productivityWindow === "custom" && (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                type="time"
                value={answers.customStart || "09:00"}
                onChange={(e) => setAnswers((prev) => ({ ...prev, customStart: e.target.value }))}
                className="rounded-md border border-white/20 bg-black/25 px-3 py-2"
              />
              <input
                type="time"
                value={answers.customEnd || "11:00"}
                onChange={(e) => setAnswers((prev) => ({ ...prev, customEnd: e.target.value }))}
                className="rounded-md border border-white/20 bg-black/25 px-3 py-2"
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="rounded-md border border-white/20 px-3 py-2 text-sm">
          Back
        </button>
        <button onClick={onNext} className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-black">
          Continue
        </button>
      </div>
    </section>
  );
}

function QuestionCard({
  title,
  options,
  selected,
  onSelect
}: {
  title: string;
  options: Array<{ id: string; label: string }>;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`rounded-xl border p-3 text-left text-sm transition ${selected === option.id ? "border-cyan-300 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.28)]" : "border-white/15"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
