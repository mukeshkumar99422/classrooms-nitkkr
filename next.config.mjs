/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', '@supabase/ssr'],
  },
  images: {
    domains: [], // Add your image domains here if needed
  },
}

export default nextConfig
