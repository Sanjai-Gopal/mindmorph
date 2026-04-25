"use client";

type Row = { rank: number; userId: string; name: string; xp: number; highlighted?: boolean };

export function Leaderboard({
  rows,
  type,
  onChangeType
}: {
  rows: Row[];
  type: "weekly" | "monthly" | "all-time";
  onChangeType: (type: "weekly" | "monthly" | "all-time") => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-semibold">Leaderboard</p>
        <div className="flex gap-1 text-xs">
          {(["weekly", "monthly", "all-time"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChangeType(t)}
              className={`rounded-full px-2 py-1 ${type === t ? "bg-cyan-400 text-black" : "border border-white/20"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div
            key={r.userId}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${r.highlighted ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20"}`}
          >
            <p>
              #{r.rank} {r.name}
            </p>
            <p className="font-semibold">{r.xp.toLocaleString()} XP</p>
          </div>
        ))}
      </div>
    </section>
  );
}
