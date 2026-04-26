"use client";

import { Plus, X } from "lucide-react";

type Props = {
  interests: string[];
  interestInput: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
};

export function InterestManager({
  interests,
  interestInput,
  onInputChange,
  onAdd,
  onRemove
}: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold">Your Interests</p>
      <p className="mt-1 text-xs text-gray-400">Used for analogy generation and personalization.</p>
      <div className="mt-3 flex gap-2">
        <input
          value={interestInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="cricket, anime, cooking..."
          className="flex-1 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
        />
        <button onClick={onAdd} className="rounded-md bg-cyan-400 px-3 py-2 text-black">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span
            key={interest}
            className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-xs"
          >
            {interest}
            <button onClick={() => onRemove(interest)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
