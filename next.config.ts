import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/access/:path*",
        destination: `${BACKEND_URL}/api/access/:path*`,
      },
      {
        source: "/api/coding/:path*",
        destination: `${BACKEND_URL}/api/coding/:path*`,
      },
      {
        source: "/api/billing/callbacks/:path*",
        destination: `${BACKEND_URL}/api/billing/callbacks/:path*`,
      },
      {
        source: "/api/billing/:path*",
        destination: `${BACKEND_URL}/api/billing/:path*`,
      },
      {
        source: "/api/ai-tutor/:path*",
        destination: `${BACKEND_URL}/api/ai-tutor/:path*`,
      },
      {
        source: "/api/quiz/:path*",
        destination: `${BACKEND_URL}/api/quiz/:path*`,
      },
      {
        source: "/api/health",
        destination: `${BACKEND_URL}/api/health`,
      },
    ];
  },
};

export default nextConfig;
