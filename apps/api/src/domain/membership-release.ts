export const MEMBERSHIP_RELEASE_PERIOD = '2025/2026';
export const MEMBERSHIP_SOURCE_SHA256 = 'c8559cd5cdcf2b92f4f107dac122be47c6f63eaaddbcd7045212278fa2f65ae7';

export const MEMBERSHIP_RELEASE_COMMISSARIATS = [
  { slug: 'its', name: 'ITS', university: 'Institut Teknologi Sepuluh Nopember', logo: '/assets/logos/its.svg', expectedCount: 87 },
  { slug: 'pens', name: 'PENS', university: 'Politeknik Elektronika Negeri Surabaya', logo: '/assets/logos/pens.svg', expectedCount: 48 },
  { slug: 'uin-madura', name: 'UIN Madura', university: 'UIN Madura', logo: '/assets/logos/uinMadura.svg', expectedCount: 50 },
  { slug: 'uinsa', name: 'UINSA', university: 'UIN Sunan Ampel Surabaya', logo: '/assets/logos/uinsa.svg', expectedCount: 83 },
  { slug: 'unair', name: 'UNAIR', university: 'Universitas Airlangga', logo: '/assets/logos/unair.svg', expectedCount: 112 },
  { slug: 'unesa', name: 'UNESA', university: 'Universitas Negeri Surabaya', logo: '/assets/logos/unesa.svg', expectedCount: 64 },
  { slug: 'unugiri', name: 'UNUGIRI', university: 'Universitas Nahdlatul Ulama Sunan Giri', logo: '/assets/logos/unugiri.svg', expectedCount: 50 },
  { slug: 'upnvjt', name: 'UPN Veteran Jatim', university: 'UPN Veteran Jawa Timur', logo: '/assets/logos/upnvjt.svg', expectedCount: 50 },
  { slug: 'utm', name: 'UTM', university: 'Universitas Trunojoyo Madura', logo: '/assets/logos/utm.svg', expectedCount: 75 },
] as const;

export const MEMBERSHIP_EXPECTED_COUNTS = Object.fromEntries(
  MEMBERSHIP_RELEASE_COMMISSARIATS.map((item) => [item.slug, item.expectedCount]),
) as Record<string, number>;

const COMMISSARIAT_ALIASES: Record<string, string> = {
  its: 'its',
  pens: 'pens',
  'uin madura': 'uin-madura',
  'uin-madura': 'uin-madura',
  uinsa: 'uinsa',
  unair: 'unair',
  unesa: 'unesa',
  unugiri: 'unugiri',
  'upn veteran jatim': 'upnvjt',
  upnvjt: 'upnvjt',
  utm: 'utm',
};

const SCOPED_DIVISION_ALIASES: Record<string, string> = {
  [`pens|${MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup & sosial`]: 'Lingkungan Hidup & Sosial',
  [`unesa|${MEMBERSHIP_RELEASE_PERIOD}|sosial dan linkungan`]: 'Sosial dan Lingkungan',
  [`upnvjt|${MEMBERSHIP_RELEASE_PERIOD}|sosial linkungan`]: 'Sosial Lingkungan',
  [`uinsa|${MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup`]: 'Lingkungan Hidup',
  [`utm|${MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup`]: 'Lingkungan Hidup',
  [`unugiri|${MEMBERSHIP_RELEASE_PERIOD}|bph 1`]: 'BPH',
  [`unugiri|${MEMBERSHIP_RELEASE_PERIOD}|bph 2`]: 'BPH',
  [`unugiri|${MEMBERSHIP_RELEASE_PERIOD}|bph 3`]: 'BPH',
  [`unair|${MEMBERSHIP_RELEASE_PERIOD}|media komunikasi; hubungan luar`]: 'Media Komunikasi & Hubungan Luar',
};

export const canonicalCommissariatSlug = (value: unknown): string | null => {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  return COMMISSARIAT_ALIASES[normalized] ?? null;
};

export const normalizeMembershipDivision = (
  value: unknown,
  scope?: { commissariatSlug?: string | null; periodLabel?: string },
): string | null => {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (/^bph [123]$/i.test(normalized)) return 'BPH';
  if (!scope?.commissariatSlug || !scope.periodLabel) return normalized;
  return SCOPED_DIVISION_ALIASES[`${scope.commissariatSlug}|${scope.periodLabel}|${normalized.toLowerCase()}`] ?? normalized;
};
