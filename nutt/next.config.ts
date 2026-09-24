import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Export estático: todo o conteúdo pré-renderizado em HTML (SEO) e hospedável em qualquer CDN.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  transpilePackages: ['three'],
};

export default nextConfig;
