"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="max-w-md text-gray-300">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-primary px-4 py-2">
        Try again
      </button>
    </div>
  );
}
