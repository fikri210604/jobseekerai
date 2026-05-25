import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests ke backend FastAPI (development)
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },

  // Izinkan gambar dari domain eksternal jika diperlukan
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
