/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    // Igual que en Tarados Malibú: sin esto, el App Router reutiliza durante
    // 30s la última visita a una página y parece que "no se actualiza".
    staleTimes: {
      dynamic: 10,
    },
  },
};

export default nextConfig;
