import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { SHARED_EVENTS } from "@/content/sharedEvents";
import { ProkerData } from "@/app/types"; // Ensure type imports

export const getProgramById = async (id: string): Promise<ProkerData | null> => {
   return new Promise((resolve) => {
      // 1. Search in SHARED_EVENTS
      const sharedEvent = SHARED_EVENTS.find((e) => String(e.id) === id);
      if (sharedEvent) {
          resolve(sharedEvent as ProkerData);
          return;
      }

      // 2. Search in COMMISSARIAT_DATA
       for (const key in COMMISSARIAT_DATA) {
        const comm = COMMISSARIAT_DATA[key];
        const found = comm.proker.find((p) => String(p.id) === id);
        if (found) {
            resolve(found);
            return;
        }
      }

      resolve(null);
   });
}

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
}
