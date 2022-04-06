/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/:code',
				destination: '/?code=:code',
				permanent: true
			}
		]
	},
	webpack5: true,
	webpack: (config) => {
		config.resolve.fallback = { fs: false, path: false }

		return config
	}
}

module.exports = nextConfig
