import type { NextConfig } from "next"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const isProduction = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
	// Static export only in production (for deployment)
	// In development, we need server features for proxy
	...(isProduction && {
		output: "export",
		trailingSlash: true,
	}),
	images: {
		unoptimized: true,
	},
	// Proxy API requests in development to avoid CORS/cookie issues
	async rewrites() {
		return [
			{
				source: "/api/proxy/:path*",
				destination: `${API_URL}/:path*`,
			},
		]
	},
}

export default nextConfig
