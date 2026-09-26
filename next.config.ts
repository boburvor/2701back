import type { NextConfig } from "next";

const apiBase = process.env.API_BASE || "http://localhost:5432";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;