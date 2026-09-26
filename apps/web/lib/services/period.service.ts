import api from "@/lib/api";

export type PublicPeriods = { periods: string[]; defaultPeriod: string };

export const EMPTY_PUBLIC_PERIODS: PublicPeriods = { periods: [], defaultPeriod: "" };

/** Reads the curated public period labels from the API (single source of truth). */
export const getPublicPeriods = async (): Promise<PublicPeriods> => {
  try {
    const response = await api.get<{ data?: PublicPeriods }>("/v1/periods");
    const data = response.data.data;
    return data && Array.isArray(data.periods) ? data : EMPTY_PUBLIC_PERIODS;
  } catch (error) {
    console.error("Error fetching public periods:", error);
    return EMPTY_PUBLIC_PERIODS;
  }
};

/** `2025/2026` -> `2025-2026`. */
export const periodSlug = (period: string) => period.replace("/", "-");

/** `2025-2026` -> `2025/2026` when the label is a known period, otherwise null. */
export const periodFromSlug = (slug: string, periods: string[]) =>
  periods.find((period) => periodSlug(period) === slug) ?? null;

/** True when the period already has published public data (used for empty states). */
export const getPeriodHasData = async (period: string): Promise<boolean> => {
  try {
    const response = await api.get<{ data?: { summary?: { total?: number } } }>("/v1/awardees", {
      params: { period },
    });
    return (response.data.data?.summary?.total ?? 0) > 0;
  } catch (error) {
    console.error(`Error checking data for period ${period}:`, error);
    return false;
  }
};
