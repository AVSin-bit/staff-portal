/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Проверки типов и линта ВКЛЮЧЕНЫ намеренно.
  // Раньше здесь стояли ignoreBuildErrors и ignoreDuringBuilds — из-за этого
  // сборка проходила зелёной, а на проде падали импорты несуществующих модулей.
};

module.exports = nextConfig;
