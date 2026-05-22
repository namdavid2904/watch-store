import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@watch-store/ui"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4566" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
