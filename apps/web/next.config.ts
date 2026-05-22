import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@watch-store/ui", "@watch-store/auth", "@watch-store/api-client"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4566" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
