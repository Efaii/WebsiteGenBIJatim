import { HomeDataResponse } from "../types/home.types";

// Logo Komisariat adalah aset statis yang jarang berubah.
// Best practice: ambil dari folder /assets, bukan dari database.
const STATIC_COMMISSARIATS = [
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

export const getHomeData = async (): Promise<HomeDataResponse> => {
  try {
    // Menarik data seluruh konten homepage via endpoint publik tunggal
    // Ini menghindari isu 'Access Denied' pada endpoint admin /faqs dan /testimonials
    const response = await fetch('http://localhost:5000/api/home', { 
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      throw new Error(`API respond with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      faqs: data.faqs || [],
      testimonials: data.testimonials || [],
      commissariats: STATIC_COMMISSARIATS, // Tetap menggunakan aset statis untuk logo
    };
  } catch (error) {
    console.error('API Fetch Error:', error);
    return {
      testimonials: [],
      faqs: [],
      commissariats: STATIC_COMMISSARIATS,
    };
  }
};