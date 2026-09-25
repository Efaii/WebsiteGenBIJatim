import { Awardee } from "@repo/types";
import { z } from "zod";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const awardeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  studyProgram: z.string(),
  division: z.string(),
  commissariat: z.object({ slug: z.string(), name: z.string() }),
  period: z.string(),
});

export const getAwardees = async (): Promise<Awardee[]> => {
  const response = await fetch(`${API_BASE}/awardee?periodLabel=2025%2F2026`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Awardee API error");
  const body = await response.json();
  const data = Array.isArray(body) ? body : body?.data;
  if (!Array.isArray(data)) throw new Error("Awardee API returned an invalid response");
  return z.array(awardeeSchema).parse(data) as Awardee[];
};
