import api from "@/lib/api";

export type PublicPeriods = { periods: string[]; defaultPeriod: string };

/**
 * Label periode publik dari API (sumber tunggal, lihat ADR 0002).
 *
 * Tidak ada fallback senyap: kalau API gagal atau bentuknya tidak sesuai,
 * error dilempar dan halaman yang memutuskan tampilannya.
 */
export const getPublicPeriods = async (): Promise<PublicPeriods> => {
  const response = await api.get<{ data?: PublicPeriods }>("/v1/periods");
  const data = response.data.data;
  if (!data || !Array.isArray(data.periods)) {
    throw new Error("Public periods API returned an unexpected shape");
  }
  return data;
};

/** `2025/2026` -> `2025-2026`. */
export const periodSlug = (period: string) => period.replace("/", "-");

/** `2025-2026` -> `2025/2026` when the label is a known period, otherwise null. */
export const periodFromSlug = (slug: string, periods: string[]) =>
  periods.find((period) => periodSlug(period) === slug) ?? null;

/** True when the period already has published public data (used for empty states). */
export const getPeriodHasData = async (period: string): Promise<boolean> => {
  const response = await api.get<{ data?: { summary?: { total?: number } } }>("/v1/awardees", {
    params: { period },
  });
  return (response.data.data?.summary?.total ?? 0) > 0;
};
