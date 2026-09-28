import type { NextConfig } from "next";

/**
 * Domain API diambil dari env supaya gambar `/uploads/**` dari API tetap bisa
 * dioptimasi ketika `NEXT_PUBLIC_API_URL` menunjuk ke staging atau produksi.
 * Default (tanpa env): API development di localhost:5000.
 */
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api");
const apiProtocol = apiUrl.protocol.replace(":", "") as "http" | "https";
const apiPort = apiUrl.port || (apiProtocol === "https" ? "443" : "80");

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types"],
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiUrl.hostname,
        // Port default (80/443) tidak ditulis agar pattern tetap cocok.
        ...(apiPort === "80" || apiPort === "443" ? {} : { port: apiPort }),
        pathname: "/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/profil", permanent: true },
    ];
  },
};

export default nextConfig;
