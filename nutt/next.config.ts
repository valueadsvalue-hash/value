import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Export estático: todo o conteúdo pré-renderizado em HTML (SEO) e hospedável em qualquer CDN.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // Preview como Artifact (claude.ai): caminhos relativos em vez de /_next/.
  ...(process.env.RELATIVE_ASSETS ? { assetPrefix: '.' } : {}),
  transpilePackages: ['three'],
};

export default nextConfig;
