/**
 * Canonical list of public period labels.
 *
 * This is the single source the public site uses for the Profil period menu
 * and for list filters. A label may be listed here before any data exists for
 * it; the database is the source of the data *within* a period, not the source
 * of the labels themselves. See docs/adr/0002-public-periods-source.md.
 */
export const PUBLIC_PERIODS = ['2025/2026', '2026/2027'] as const;

export type PublicPeriod = (typeof PUBLIC_PERIODS)[number];

export const DEFAULT_PUBLIC_PERIOD: PublicPeriod = PUBLIC_PERIODS[0];

/** `2025/2026` -> `2025-2026`, for use in routes like `/profil/2025-2026`. */
export const periodToSlug = (period: string) => period.replace('/', '-');

/** `2025-2026` -> `2025/2026`, or null when the label is not a known period. */
export const periodFromSlug = (slug: string): PublicPeriod | null =>
  PUBLIC_PERIODS.find((period) => periodToSlug(period) === slug) ?? null;
