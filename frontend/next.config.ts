import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: "standalone",

  // Allow external image domains used in the app
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },

  // Allow environment variable to reach the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  },
};

export default nextConfig;
