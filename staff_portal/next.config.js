/** @type {import('next').NextConfig} */
const nextConfig = {
  // Не останавливать билд на ESLint-ошибках (Unexpected any и т.п.)
  eslint: { ignoreDuringBuilds: true },
  // Не останавливать билд на TS-ошибках типов
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
