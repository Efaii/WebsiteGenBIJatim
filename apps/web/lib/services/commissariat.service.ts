import { CommissariatData } from "@repo/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type CommissariatSummary = {
  id: string;
  slug: string;
  name: string;
  university: string;
  logo_univ: string;
  logoGenbi: string;
  coverImage: string;
  description: string;
  memberCount: number;
  prokerCount: number;
};

export const getAllCommissariats = async (): Promise<CommissariatSummary[]> => {
  const res = await fetch(`${API_BASE}/commissariats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch commissariats: ${res.status}`);
  return await res.json();
};

export const getCommissariatBySlug = async (slug: string): Promise<CommissariatData | null> => {
  const res = await fetch(`${API_BASE}/commissariats/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch commissariat ${slug}: ${res.status}`);
  return await res.json();
};

export const getCommissariatCount = async (): Promise<number> => {
  const res = await fetch(`${API_BASE}/commissariats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch commissariats: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
};

export const getGlobalCommissariatStats = async (): Promise<{
  totalProker: number;
  totalCommissariats: number;
  totalMembers: number;
}> => {
  const res = await fetch(`${API_BASE}/commissariats/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch commissariat stats: ${res.status}`);
  return await res.json();
};
