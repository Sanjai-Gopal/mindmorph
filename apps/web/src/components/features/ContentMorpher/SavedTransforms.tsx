"use client";

import { Trash2 } from "lucide-react";
import type { TransformRecord } from "@/hooks/useContentTransform";

type Props = {
  items: TransformRecord[];
  loading: boolean;
  onOpen: (item: TransformRecord) => void;
  onDelete: (id: string) => void;
};

export function SavedTransforms({ items, loading, onOpen, onDelete }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-lg font-semibold">Saved Transformations</p>
      {loading ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <button onClick={() => onOpen(item)} className="w-full text-left">
                <p className="font-medium">{item.subject}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {item.format} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-gray-300">{item.originalContent}</p>
              </button>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span>Rating: {item.qualityRating ?? "-"}/5</span>
                <button onClick={() => onDelete(item.id)} className="rounded border border-white/20 p-1">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">No saved transformations yet.</p>}
        </div>
      )}
    </section>
  );
}
