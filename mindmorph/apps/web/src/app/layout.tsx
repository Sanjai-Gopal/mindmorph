import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "@/app/globals.css";
import { Providers } from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "MindMorph | Adaptive AI Learning",
    template: "%s | MindMorph"
  },
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
    url: "http://localhost:3000",
    siteName: "MindMorph"
  },
  twitter: {
    card: "summary_large_image",
    title: "MindMorph",
    description: "Study Smarter, Not Harder"
  },
  icons: {
    icon: "/icons/icon.svg",
    shortcut: "/icons/icon.svg",
    apple: "/icons/icon.svg"
  },
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070f"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get("x-nonce") ?? undefined;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MindMorph",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "MindMorph helps students learn faster using adaptive AI transformations and live study analytics."
  };

  return (
    <html lang="en">
      <body className={inter.variable}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-black focus:px-3 focus:py-2">
          Skip to content
        </a>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
