import type { NextConfig } from "next";

const apiBase = process.env.API_BASE || "http://localhost:5432";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Frontend fetch('/api/...') so'rovlarini backend'ga proxy qiladi
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
      // Swagger UI sahifasi. Express /api-docs ni /api-docs/ ga 301 qiladi,
      // shuning uchun darhol trailing slash bilan so'raymiz (redirect loop oldini olish uchun)
      {
        source: "/api-docs",
        destination: `${apiBase}/api-docs/`,
      },
      {
        source: "/api-docs/:path*",
        destination: `${apiBase}/api-docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
