"use client";

import type { TransformFormat } from "@/hooks/useContentTransform";

type Props = {
  value: TransformFormat;
  onChange: (value: TransformFormat) => void;
};

const options: Array<{ value: TransformFormat; label: string }> = [
  { value: "story", label: "📖 Story Mode" },
  { value: "visual", label: "🎨 Visual Mode" },
  { value: "challenge", label: "🎮 Challenge Mode" },
  { value: "analogy", label: "🧩 Analogy Mode" }
];

export function FormatSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-2 text-sm transition ${
            value === option.value
              ? "bg-cyan-400 text-black shadow-[0_0_18px_rgba(34,211,238,0.5)]"
              : "border border-white/20 bg-black/20 text-gray-200 hover:border-cyan-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
