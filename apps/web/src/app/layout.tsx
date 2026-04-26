import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "MindMorph | Adaptive AI Learning",
  description:
    "MindMorph helps college students study smarter through AI-powered content transformation, behavior analysis, and adaptive study workflows.",
  keywords: [
    "adaptive learning",
    "AI study platform",
    "college learning",
    "study analytics",
    "MindMorph"
  ],
  openGraph: {
    title: "MindMorph | Study Smarter, Not Harder",
    description: "An AI-powered adaptive learning platform for complex topics.",
    type: "website",
    url: "http://localhost:3000"
  },
  twitter: {
    card: "summary_large_image",
    title: "MindMorph",
    description: "Study Smarter, Not Harder"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
