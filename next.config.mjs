/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/results',
  reactStrictMode: false,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.devtool = 'source-map';
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;