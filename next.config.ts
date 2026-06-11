import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for Cloudinary-hosted images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Serve modern formats for smaller payloads
    formats: ['image/avif', 'image/webp'],
  },

  // Reduce serverless cold-start time
  experimental: {
    // Enable server-side CSS optimization  
    optimizeCss: false,
  },

  // Performance headers for static assets
  async headers() {
    return [
      {
        // Apply to all static assets
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        // Cache immutable assets aggressively
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
