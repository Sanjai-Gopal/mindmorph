"use client";

import { Lightbulb } from "lucide-react";

type Recommendation = { id: string; text: string; action: string };

export function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Recommendations</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="inline-flex items-start gap-2 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 text-amber-300" />
              {item.text}
            </p>
            <button className="mt-2 rounded-md border border-white/20 px-2 py-1 text-xs">{item.action}</button>
          </div>
        ))}
      </div>
    </article>
  );
}
