import type { NextConfig } from "next";
import path from "path";

const s3ImageHostname = process.env.S3_IMAGE_HOSTNAME;

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@watch-store/ui", "@watch-store/auth", "@watch-store/api-client"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self)",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4566" },
      ...(s3ImageHostname
        ? [{ protocol: "https" as const, hostname: s3ImageHostname }]
        : []),
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
