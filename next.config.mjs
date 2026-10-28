/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Fyrama preprocesa imágenes con sharp (WebP/AVIF + srcset propios).
    // No delegamos la optimización a Next Image para mantener control total.
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Imágenes de marca que el cliente puede reemplazar conservando el
        // nombre: se revalidan para no quedarse con la versión anterior.
        source: "/media/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;