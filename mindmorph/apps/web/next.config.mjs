let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === "true") {
  const analyzer = await import("@next/bundle-analyzer");
  withBundleAnalyzer = analyzer.default({ enabled: true });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },
  images: {
    domains: ["zdmvvurapaxfutancsow.supabase.co", "lh3.googleusercontent.com", "avatars.githubusercontent.com"],
    formats: ["image/avif", "image/webp"]
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}"
    }
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=120" }]
      }
    ];
  }
};

export default withBundleAnalyzer(nextConfig);