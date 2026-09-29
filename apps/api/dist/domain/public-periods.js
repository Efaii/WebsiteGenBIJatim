"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.periodFromSlug = exports.periodToSlug = exports.DEFAULT_PUBLIC_PERIOD = exports.PUBLIC_PERIODS = void 0;
/**
 * Canonical list of public period labels.
 *
 * This is the single source the public site uses for the Profil period menu
 * and for list filters. A label may be listed here before any data exists for
 * it; the database is the source of the data *within* a period, not the source
 * of the labels themselves. See docs/adr/0002-public-periods-source.md.
 */
exports.PUBLIC_PERIODS = ['2025/2026', '2026/2027'];
exports.DEFAULT_PUBLIC_PERIOD = exports.PUBLIC_PERIODS[0];
/** `2025/2026` -> `2025-2026`, for use in routes like `/profil/2025-2026`. */
const periodToSlug = (period) => period.replace('/', '-');
exports.periodToSlug = periodToSlug;
/** `2025-2026` -> `2025/2026`, or null when the label is not a known period. */
const periodFromSlug = (slug) => exports.PUBLIC_PERIODS.find((period) => (0, exports.periodToSlug)(period) === slug) ?? null;
exports.periodFromSlug = periodFromSlug;
