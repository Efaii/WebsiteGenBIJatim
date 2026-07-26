import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { SHARED_EVENTS } from "@/content/sharedEvents";
import { ProkerData } from "@/app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function flattenMockPrograms(): ProkerData[] {
  const list: ProkerData[] = [];
  SHARED_EVENTS.forEach((e) => list.push(e as ProkerData));
  Object.values(COMMISSARIAT_DATA).forEach((comm) => {
    comm.proker.forEach((p) => list.push(p));
  });
  return list;
}

export const getAllPrograms = async (): Promise<ProkerData[]> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/proker`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    console.warn("[program.service] API unavailable, using mock data");
    return flattenMockPrograms();
  }
};

export const getProgramById = async (id: string): Promise<ProkerData | null> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/proker/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    // Fallback ke mock data
    console.warn("[program.service] API unavailable, using mock data");

    // 1. Search in SHARED_EVENTS
    const sharedEvent = SHARED_EVENTS.find((e) => String(e.id) === id);
    if (sharedEvent) return sharedEvent as ProkerData;

    // 2. Search in COMMISSARIAT_DATA
    for (const key in COMMISSARIAT_DATA) {
      const comm = COMMISSARIAT_DATA[key];
      const found = comm.proker.find((p) => String(p.id) === id);
      if (found) return found;
    }

    return null;
  }
};

export const getAllProgramIds = async () => {
  try {
    const programs = await getAllPrograms();
    if (programs.length > 0) {
      return programs.map((p) => ({ id: String(p.id) }));
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
  }

  if (process.env.NODE_ENV !== "development") throw new Error("API error");
  return flattenMockPrograms().map((p) => ({ id: String(p.id) }));
};

