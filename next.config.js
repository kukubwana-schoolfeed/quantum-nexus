/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@google-cloud/aiplatform", "google-auth-library", "google-gax"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.quantumnexus.app",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
module.exports = nextConfig;
