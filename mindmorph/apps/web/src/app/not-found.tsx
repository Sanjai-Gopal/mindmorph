import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-4 grid h-24 w-24 place-content-center rounded-3xl border border-cyan-300/40 bg-cyan-400/10 text-4xl">
          🧭
        </div>
        <h1 className="text-3xl font-black">Lost in the study maze?</h1>
        <p className="mt-2 text-gray-300">Let&apos;s get you back on track.</p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-black">
            Go Home
          </Link>
          <input
            aria-label="Search"
            placeholder="Search topics..."
            className="rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </main>
  );
}
