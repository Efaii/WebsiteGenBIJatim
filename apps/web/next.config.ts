import type { NextConfig } from "next";

/**
 * Domain API diambil dari env supaya gambar `/uploads/**` dari API tetap bisa
 * dioptimasi ketika `NEXT_PUBLIC_API_URL` menunjuk ke staging atau produksi.
 * Default (tanpa env): API development di localhost:5000.
 */
const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
);
const apiProtocol = apiUrl.protocol.replace(":", "") as "http" | "https";
const apiPort = apiUrl.port || (apiProtocol === "https" ? "443" : "80");
/*
 * Next 16 memblokir IP privat (termasuk localhost) di optimizer `next/image`.
 * API dev berjalan di localhost, jadi pengecualian ini dinyalakan HANYA untuk
 * host lokal; di staging/produksi (host publik) optimizer tetap ketat.
 */
const isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname);

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/types"],
  images: {
    ...(isLocalApi ? { dangerouslyAllowLocalIP: true } : {}),
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
      /*
       * Jalur admin lama dipensiunkan; CMS kanonik hidup di /cms. Pengalihan
       * menjaga tautan lama tidak menjadi 404.
       */
      { source: "/admin", destination: "/cms", permanent: true },
      { source: "/admin/:path*", destination: "/cms", permanent: true },
    ];
  },
};

export default nextConfig;
