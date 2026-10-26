import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 is processed through Turbopack (the default bundler in Next 16).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Serve remote images directly (no server-side optimizer in the path) so the
    // storefront works reliably offline of any image CDN rate limits.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
