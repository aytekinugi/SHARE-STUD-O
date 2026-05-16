/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const extraOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: Array.from(new Set(["localhost:3000", ...extraOrigins]))
    }
  }
};

export default withBundleAnalyzer(nextConfig);
