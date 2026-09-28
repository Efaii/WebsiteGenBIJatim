import { HomeDataResponse } from "../types/home.types";

// Logo Komisariat adalah aset statis yang jarang berubah.
// Best practice: ambil dari folder /assets, bukan dari database.
export const STATIC_COMMISSARIATS = [
  { id: "unair", name: "Universitas Airlangga", logo: "/assets/logos/unair.svg" },
  { id: "unesa", name: "Universitas Negeri Surabaya", logo: "/assets/logos/unesa.svg" },
  { id: "its", name: "Institut Teknologi Sepuluh Nopember", logo: "/assets/logos/its.svg" },
  { id: "upnvjt", name: "UPN Veteran Jawa Timur", logo: "/assets/logos/upnvjt.svg" },
  { id: "uinsa", name: "UIN Sunan Ampel Surabaya", logo: "/assets/logos/uinsa.svg" },
  { id: "pens", name: "Politeknik Elektronika Negeri Surabaya", logo: "/assets/logos/pens.svg" },
  { id: "utm", name: "Universitas Trunojoyo Madura", logo: "/assets/logos/utm.svg" },
  { id: "unugiri", name: "UNU Sunan Giri Bojonegoro", logo: "/assets/logos/unugiri.svg" },
  { id: "uin-madura", name: "UIN Madura", logo: "/assets/logos/uinMadura.svg" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getHomeData = async (): Promise<HomeDataResponse> => {
  // Endpoint publik tunggal untuk konten Beranda (menghindari endpoint admin).
  // Kegagalan dilempar: Beranda menangkapnya per bagian dan menampilkan state
  // gagal, bukan area kosong.
  const response = await fetch(`${API_BASE}/home`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Home API responded with status: ${response.status}`);
  }

  const data = await response.json();

  return {
    faqs: data.faqs || [],
    testimonials: data.testimonials || [],
    commissariats: STATIC_COMMISSARIATS, // Logo komisariat tetap aset statis
  };
};
