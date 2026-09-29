import { HomeDataResponse } from "../types/home.types";

// Logo Komisariat adalah aset statis yang jarang berubah.
// Best practice: ambil dari folder /assets, bukan dari database.
//
// Berkasnya WebP hasil rasterisasi dari SVG aslinya (lihat
// .playwright-mcp/fase-9/convert.mjs). SVG lamanya adalah hasil auto-trace
// dengan presisi absurd — 9 berkas itu totalnya 4,56 MB, dan karena marquee
// menduplikasi daftarnya, browser harus mengurai 4,56 MB data path lalu
// merasterisasi 18 instance tepat saat pengguna men-scroll ke section Mitra.
// Versi WebP-nya 189 KB untuk sembilan berkas (turun 96%), dan tetap tajam
// karena dirender pada 288 px untuk ukuran tampil maksimum 96 px.
export const STATIC_COMMISSARIATS = [
  {
    id: "unair",
    name: "Universitas Airlangga",
    logo: "/assets/logos/unair.webp",
  },
  {
    id: "unesa",
    name: "Universitas Negeri Surabaya",
    logo: "/assets/logos/unesa.webp",
  },
  {
    id: "its",
    name: "Institut Teknologi Sepuluh Nopember",
    logo: "/assets/logos/its.webp",
  },
  {
    id: "upnvjt",
    name: "UPN Veteran Jawa Timur",
    logo: "/assets/logos/upnvjt.webp",
  },
  {
    id: "uinsa",
    name: "UIN Sunan Ampel Surabaya",
    logo: "/assets/logos/uinsa.webp",
  },
  {
    id: "pens",
    name: "Politeknik Elektronika Negeri Surabaya",
    logo: "/assets/logos/pens.webp",
  },
  {
    id: "utm",
    name: "Universitas Trunojoyo Madura",
    logo: "/assets/logos/utm.webp",
  },
  {
    id: "unugiri",
    name: "UNU Sunan Giri Bojonegoro",
    logo: "/assets/logos/unugiri.webp",
  },
  {
    id: "uin-madura",
    name: "UIN Madura",
    logo: "/assets/logos/uinMadura.webp",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/*
 * Data Beranda dari jalur kanonik: FAQ publik `/v1/faqs` (aktif, terurut);
 * logo komisariat tetap aset statis. Jalur lama `/api/home` dipensiunkan.
 * Kegagalan dilempar supaya Beranda menampilkan state gagal per bagian.
 */
export const getHomeData = async (): Promise<HomeDataResponse> => {
  const response = await fetch(`${API_BASE}/v1/faqs`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`FAQ API responded with status: ${response.status}`);
  }

  const payload = await response.json();

  return {
    faqs: Array.isArray(payload?.data) ? payload.data : [],
    commissariats: STATIC_COMMISSARIATS,
  };
};
