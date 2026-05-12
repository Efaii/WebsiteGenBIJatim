import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { SHARED_EVENTS } from "@/content/sharedEvents";
import { ProkerData } from "@/app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getProgramById = async (id: string): Promise<ProkerData | null> => {
  try {
    const res = await fetch(`${API_BASE}/commissariats/proker/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (error) {
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
  const paths: { id: string }[] = [];

  SHARED_EVENTS.forEach((e) => {
    paths.push({ id: String(e.id) });
  });

  Object.values(COMMISSARIAT_DATA).forEach((comm) => {
    comm.proker.forEach((p) => {
      paths.push({ id: String(p.id) });
    });
  });

  return paths;
};

