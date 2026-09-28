import { ProkerData } from "@/app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Program kerja publik.
 *
 * Service ini sengaja tidak punya fallback mock. Kalau API gagal, error
 * dilempar dan halaman yang memutuskan tampilannya (lihat "state jujur",
 * docs/specs/public-web-hardening.md S1). Sebelumnya ada fallback mock
 * dev-only ke `content/commissariatData.ts` dan `content/sharedEvents.ts`
 * yang membuat halaman tampak berisi padahal datanya karangan.
 */
export const getAllPrograms = async (): Promise<ProkerData[]> => {
  const res = await fetch(`${API_BASE}/commissariats/proker`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Program list API error: ${res.status}`);
  return await res.json();
};

export const getProgramById = async (id: string): Promise<ProkerData | null> => {
  const res = await fetch(`${API_BASE}/commissariats/proker/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Program detail API error: ${res.status}`);
  return await res.json();
};

export const getAllProgramIds = async (): Promise<Array<{ id: string }>> => {
  const programs = await getAllPrograms();
  return programs.map((program) => ({ id: String(program.id) }));
};
