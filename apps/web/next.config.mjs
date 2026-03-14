import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Required for standalone to trace files in parent workspace packages
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ["@workspace/ui"],
}

export default nextConfig
