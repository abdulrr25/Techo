/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["teacho.xyz"],
  },

  poweredByHeader: false,
  compress: true,

  env: {
    NEXT_PUBLIC_HUDDLE_API_KEY: process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },

  async headers() {
    return [
      {
        // API routes: strict security, no cam/mic needed
        source: "/api/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // All other pages: allow camera & mic for video calls
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            // Allow camera & mic for the video call page
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  webpack: (config) => {
    // @privy-io/react-auth v3 optionally imports @farcaster/mini-app-solana
    // for Farcaster mini-app support. We don't use Farcaster, so stub it out
    // to prevent a build-blocking "Module not found" error.
    config.resolve.alias["@farcaster/mini-app-solana"] = false;
    return config;
  },
};

module.exports = nextConfig;
