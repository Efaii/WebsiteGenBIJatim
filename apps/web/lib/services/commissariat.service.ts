import api from "@/lib/api";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { CommissariatData } from "@repo/types";

const getApiBase = () => {
  if (typeof window !== "undefined") {
    // Di client side, gunakan host yang sedang diakses agar tidak stuck di localhost
    const host = window.location.hostname;
    return `http://${host}:5000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

const API_BASE = getApiBase();

export const getAllCommissariats = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.warn("[commissariat.service] API unavailable, using mock data");
    return Object.values(COMMISSARIAT_DATA).map(c => ({
      ...c,
      logo_univ: (c as any).logo_univ || (c as any).logo,
      memberCount: (c as any).memberCount || (c as any).members || 0,
      prokerCount: (c as any).prokerCount || 24,
    }));
  }
};

export const getCommissariatBySlug = async (slug: string): Promise<CommissariatData | null> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.warn("[commissariat.service] API unavailable, using mock data");
    return COMMISSARIAT_DATA[slug] || null;
  }
};

export const getCommissariatCount = async (): Promise<number> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.length;
  } catch (error) {
    return Object.keys(COMMISSARIAT_DATA).length;
  }
};

export const getGlobalCommissariatStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/stats`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    console.warn("[commissariat.service] API stats unavailable, using fallback");
    const mockData = Object.values(COMMISSARIAT_DATA);
    return {
      totalProker: 45,
      totalCommissariats: mockData.length,
      totalMembers: mockData.reduce((acc, curr) => acc + ((curr as any).memberCount || (curr as any).members || 0), 0),
    };
  }
};
