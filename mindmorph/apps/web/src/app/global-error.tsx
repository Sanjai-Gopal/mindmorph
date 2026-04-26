"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#07070f] px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
          <p className="text-sm text-rose-300">Something went wrong</p>
          <h1 className="mt-2 text-2xl font-bold">We hit an unexpected error.</h1>
          <p className="mt-2 text-sm text-gray-300">
            Try again. If this keeps happening, refresh the page and retry your action.
          </p>
          <button onClick={reset} className="mt-5 rounded-md border border-white/20 px-4 py-2 text-sm">
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
