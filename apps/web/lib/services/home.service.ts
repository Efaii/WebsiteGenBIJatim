import { HomeDataResponse } from "@/types/home.types";

/**
 * @service HomeService (Frontend)
 * @description Fetches aggregated homepage data (testimonials, FAQs, commissariats).
 * Uses native fetch for Next.js ISR revalidation support.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

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
    const response = await fetch(`${API_URL}/home`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      faqs: data.faqs || [],
      testimonials: data.testimonials || [],
      commissariats: STATIC_COMMISSARIATS,
    };
  } catch (error) {
    console.error("API Fetch Error:", error);
    return {
      testimonials: [],
      faqs: [],
      commissariats: STATIC_COMMISSARIATS,
    };
  }
};
