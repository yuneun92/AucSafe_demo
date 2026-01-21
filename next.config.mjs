/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // 로컬 개발 시에는 비활성화
  // basePath: '/AucSafe_demo', // 배포 시에만 사용
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
