import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/browse',
        destination: '/',
        permanent: false, // 307 temporary redirect - easily reversible
      },
    ];
  },
};

export default nextConfig;
