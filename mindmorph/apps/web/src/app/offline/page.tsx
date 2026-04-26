import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-3xl">📡</p>
        <h1 className="mt-2 text-2xl font-bold">You are offline</h1>
        <p className="mt-2 text-sm text-gray-300">
          Cached pages are still available. Reconnect to sync your latest study progress.
        </p>
        <Link href="/" className="mt-5 inline-block rounded-md border border-white/20 px-4 py-2 text-sm">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
