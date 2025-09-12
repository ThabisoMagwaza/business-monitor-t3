import { env } from './src/env.js';
import nextPWA from '@ducanh2912/next-pwa';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [new URL(`${env.BLOB_URL}/**`)],
  },
};

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  // Enable in dev when NEXT_PUBLIC_ENABLE_PWA=1 is set
  disable:
    process.env.NODE_ENV === 'development' &&
    !process.env.NEXT_PUBLIC_ENABLE_PWA,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

export default withPWA(config);
