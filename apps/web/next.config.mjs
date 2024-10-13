import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";
import { withTypedHandlers } from "typed-handlers/next";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./env");

/** @type {import('next').NextConfig} */
const nextConfig = withTypedHandlers({});

export default nextConfig;
