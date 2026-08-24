/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 确保所有 API 路由使用 Node.js 运行时
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
};

module.exports = nextConfig;
