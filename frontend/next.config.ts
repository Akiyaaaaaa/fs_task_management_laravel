import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Allow images served from the Laravel storage public disk.
   * Adjust the hostname if your backend runs on a different host/port.
   */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/storage/**',
      },
    ],
  },

  /**
   * Proxy /api/* requests to the Laravel backend to avoid CORS issues in
   * development. In production, configure your reverse proxy (nginx/Caddy)
   * instead.
   */
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
