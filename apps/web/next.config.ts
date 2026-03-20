import type { NextConfig } from 'next';

const apiBase =
  process.env.API_REWRITE_TARGET ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  async rewrites() {
    const base = apiBase.replace(/\/$/, '');
    return [
      {
        source: '/api/keys/:path*',
        destination: `${base}/api/keys/:path*`,
      },
      {
        source: '/api/metrics/:path*',
        destination: `${base}/api/metrics/:path*`,
      },
    ];
  },
};

export default nextConfig;
