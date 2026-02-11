import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { CommissariatData } from "@repo/types";

export const getAllCommissariats = async (): Promise<CommissariatData[]> => {
  return new Promise((resolve) => {
    const data = Object.values(COMMISSARIAT_DATA);
    setTimeout(() => resolve(data), 100);
  });
};

export const getCommissariatBySlug = async (slug: string): Promise<CommissariatData | null> => {
  return new Promise((resolve) => {
    const data = COMMISSARIAT_DATA[slug];
    setTimeout(() => resolve(data || null), 100);
  });
};

export const getCommissariatCount = async (): Promise<number> => {
   return new Promise((resolve) => {
    setTimeout(() => resolve(Object.keys(COMMISSARIAT_DATA).length), 100);
  });
}
