import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";


const nextConfig: NextConfig = {
  generateEtags: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-accordion",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "framer-motion"
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/create",
        destination: "/#builder",
        permanent: false,
      },
      {
        source: "/biodata",
        destination: "/biodata-templates",
        permanent: true,
      },
      {
        source: "/blog/:lang(en|eng|hi|mr|gu)/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);