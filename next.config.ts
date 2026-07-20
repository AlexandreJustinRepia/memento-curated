import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Allow larger uploads to reach the API handler so Sharp can resize them.
    // Next.js default body limit is 4 MB; we raise it to 50 MB here.
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
