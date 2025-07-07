/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'fs.teratany.org', 'images.unsplash.com'],
    unoptimized: true,
  },
  env: {
    FILE_SERVER_URL: process.env.FILE_SERVER_URL || 'http://localhost:3000',
    FILE_SERVER_API_KEY: process.env.FILE_SERVER_API_KEY || 'votre-api-key-secret',
  },
}

export default nextConfig
