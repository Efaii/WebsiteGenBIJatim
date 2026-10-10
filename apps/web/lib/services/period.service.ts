const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";
const PUBLIC_CACHE = { next: { revalidate: 60 } } as const;

export type PublicPeriods = { periods: string[]; defaultPeriod: string };

/**
 * Label periode publik dari API (sumber tunggal, lihat ADR 0002).
 *
 * Tidak ada fallback senyap: kalau API gagal atau bentuknya tidak sesuai,
 * error dilempar dan halaman yang memutuskan tampilannya.
 */
export const getPublicPeriods = async (): Promise<PublicPeriods> => {
  const response = await fetch(`${API_BASE}/v1/periods`, PUBLIC_CACHE);
  if (!response.ok) throw new Error(`Public periods API error: ${response.status}`);
  const body = await response.json();
  const data = body.data as PublicPeriods | undefined;
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
  const response = await fetch(`${API_BASE}/v1/awardees?period=${encodeURIComponent(period)}`, PUBLIC_CACHE);
  if (!response.ok) throw new Error(`Awardee API error: ${response.status}`);
  const body = await response.json();
  return (body.data?.summary?.total ?? 0) > 0;
};
