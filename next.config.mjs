/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://43.173.2.162';
    const backendUrl = rawUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/docs\/?$/i, '')
      .replace(/\/api\/?$/i, '')
      .replace(/https:\/\/43\.173\.2\.162\.sslip\.io/i, 'http://43.173.2.162');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;