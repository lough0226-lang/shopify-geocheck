/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  async redirects() {
    return [
      // www.mygeocheck.com -> 根域永久重定向（覆盖根路径 '/'）
      {
        source: '/',
        has: [{ type: 'host', value: 'www.mygeocheck.com' }],
        destination: 'https://mygeocheck.com/',
        permanent: true,
      },
      // www.mygeocheck.com 下的所有其他路径
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mygeocheck.com' }],
        destination: 'https://mygeocheck.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
