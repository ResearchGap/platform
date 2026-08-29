import { env } from "@platform/env/web";
import type { NextConfig } from "next";

const serverApiOrigin = env.SERVER_API_ORIGIN.replace(/\/$/, "");

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${serverApiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
