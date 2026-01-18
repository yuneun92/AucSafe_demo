/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/AucSafe_demo',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
