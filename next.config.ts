import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["zlib-sync"],
  turbopack: {
    root: path.resolve()
  }
};

export default nextConfig;
