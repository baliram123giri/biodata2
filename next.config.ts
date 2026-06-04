import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "biodata99.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/create",
        destination: "/#builder",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
// Trigger Next.js server reload for Peacock Theme
