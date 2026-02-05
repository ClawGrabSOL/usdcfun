import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config to silence warning
  turbopack: {},
  // Allow images from any domain for token images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
