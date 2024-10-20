import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";
import { withTypedHandlers } from "typed-handlers/next";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./env");

/** @type {import('next').NextConfig} */
const nextConfig = withTypedHandlers({
  experimental: {
    serverComponentsExternalPackages: ["pdfmake"],
  },
  images: {
    remotePatterns: [
      {
        hostname: "files.build0.dev",
      },
      {
        hostname: "assets.build0.dev",
      },
    ],
  },
});

export default nextConfig;
