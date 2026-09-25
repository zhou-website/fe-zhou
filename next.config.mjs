/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://43.173.2.162/api/:path*',
      },
    ];
  },
};

export default nextConfig;