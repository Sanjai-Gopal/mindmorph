export default function LiveStudyLoading() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-white/10 xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
