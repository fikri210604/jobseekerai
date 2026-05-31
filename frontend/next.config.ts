import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone agar bisa di-dockerize untuk Cloud Run
  output: "standalone",

  // Proxy API requests ke route handler lokal (/api/proxy) 
  // agar API Key disuntikkan secara aman di sisi server.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "/api/proxy/api/v1/:path*",
      },
      {
        source: "/health",
        destination: "/api/proxy/health",
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
