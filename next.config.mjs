/** @type {import('next').NextConfig} */

// Repository subpath for GitHub Pages project sites, e.g. /escala-funcionarios.
// In GitHub Actions we set NEXT_PUBLIC_BASE_PATH automatically from the repo name.
// Locally it is empty so the app runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  // Static HTML export -> outputs to ./out, deployable to GitHub Pages.
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // Ensures each route is emitted as a folder with index.html (GitHub Pages friendly).
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
