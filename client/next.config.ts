import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.4"],
  async redirects() {
    return [
      {
        source: "/order",
        destination: "/orders",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
