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
	}
}

module.exports = nextConfig
