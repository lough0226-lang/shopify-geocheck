/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  // Force cache bust
  env: {
    BUILD_ID: Date.now().toString(),
  },
};

module.exports = nextConfig;
