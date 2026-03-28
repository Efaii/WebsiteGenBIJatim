import api from "@/lib/api";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { CommissariatData } from "@repo/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getAllCommissariats = async (): Promise<CommissariatData[]> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats`, {
      next: { revalidate: 60 }, // cache 60 detik untuk SSR
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    // Fallback ke mock data jika API belum jalan
    console.warn("[commissariat.service] API unavailable, using mock data");
    return Object.values(COMMISSARIAT_DATA);
  }
};

export const getCommissariatBySlug = async (slug: string): Promise<CommissariatData | null> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    // Fallback ke mock data
    console.warn("[commissariat.service] API unavailable, using mock data");
    return COMMISSARIAT_DATA[slug] || null;
  }
};

export const getCommissariatCount = async (): Promise<number> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.length;
  } catch (error) {
    return Object.keys(COMMISSARIAT_DATA).length;
  }
};

