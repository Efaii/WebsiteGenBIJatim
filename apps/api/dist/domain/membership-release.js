"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMembershipDivision = exports.canonicalCommissariatSlug = exports.MEMBERSHIP_RELEASE_DIVISIONS = exports.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS = exports.MEMBERSHIP_EXPECTED_COUNTS = exports.MEMBERSHIP_RELEASE_COMMISSARIATS = exports.MEMBERSHIP_SOURCE_SHA256 = exports.MEMBERSHIP_RELEASE_PERIOD = void 0;
exports.MEMBERSHIP_RELEASE_PERIOD = '2025/2026';
exports.MEMBERSHIP_SOURCE_SHA256 = 'c8559cd5cdcf2b92f4f107dac122be47c6f63eaaddbcd7045212278fa2f65ae7';
exports.MEMBERSHIP_RELEASE_COMMISSARIATS = [
    { slug: 'its', name: 'ITS', university: 'Institut Teknologi Sepuluh Nopember', logo: '/assets/logos/its.svg', expectedCount: 87 },
    { slug: 'pens', name: 'PENS', university: 'Politeknik Elektronika Negeri Surabaya', logo: '/assets/logos/pens.svg', expectedCount: 48 },
    { slug: 'uin-madura', name: 'UIN Madura', university: 'UIN Madura', logo: '/assets/logos/uinMadura.svg', expectedCount: 50 },
    { slug: 'uinsa', name: 'UINSA', university: 'UIN Sunan Ampel Surabaya', logo: '/assets/logos/uinsa.svg', expectedCount: 83 },
    { slug: 'unair', name: 'UNAIR', university: 'Universitas Airlangga', logo: '/assets/logos/unair.svg', expectedCount: 112 },
    { slug: 'unesa', name: 'UNESA', university: 'Universitas Negeri Surabaya', logo: '/assets/logos/unesa.svg', expectedCount: 64 },
    { slug: 'unugiri', name: 'UNUGIRI', university: 'Universitas Nahdlatul Ulama Sunan Giri', logo: '/assets/logos/unugiri.svg', expectedCount: 50 },
    { slug: 'upnvjt', name: 'UPN Veteran Jatim', university: 'UPN Veteran Jawa Timur', logo: '/assets/logos/upnvjt.svg', expectedCount: 50 },
    { slug: 'utm', name: 'UTM', university: 'Universitas Trunojoyo Madura', logo: '/assets/logos/utm.svg', expectedCount: 75 },
];
exports.MEMBERSHIP_EXPECTED_COUNTS = Object.fromEntries(exports.MEMBERSHIP_RELEASE_COMMISSARIATS.map((item) => [item.slug, item.expectedCount]));
exports.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS = {
    its: 46,
    pens: 2,
    'uin-madura': 1,
    uinsa: 34,
    unair: 30,
    unesa: 0,
    unugiri: 0,
    upnvjt: 0,
    utm: 14,
};
exports.MEMBERSHIP_RELEASE_DIVISIONS = {
    its: ['Hubungan Masyarakat', 'Sosial dan Lingkungan', 'Media dan Publikasi', 'Pengembangan Organisasi', 'BPH'],
    pens: ['Media Informasi & Komunikasi', 'Lingkungan Hidup & Sosial', 'Kesehatan Masyarakat', 'Pengembangan Sumber Daya Mahasiswa', 'BPH', 'Ekonomi Kreatif', 'Pendidikan & Kreativitas'],
    'uin-madura': ['BPH', 'Lingkungan Hidup & Kesehatan Masyarakat', 'Kewirausahaan', 'Komunikasi & Informasi', 'Pendidikan'],
    uinsa: ['Media Informasi', 'Pendidikan', 'Pengembangan Sumber Daya Mahasiswa', 'Lingkungan Hidup', 'BPH', 'Pariwisata & Ekonomi Kreatif', 'Kesehatan & Sosial Masyarakat'],
    unair: ['Media Komunikasi', 'Ekonomi Kreatif', 'Hubungan Luar', 'Kontrol Mutu Internal', 'Pengembangan Sumber Daya Mahasiswa', 'Pengabdian Masyarakat', 'BPH', 'Pendidikan', 'Media Komunikasi & Hubungan Luar'],
    unesa: ['BPH', 'Pengembangan Sumber Daya Mahasiswa', 'Sosial dan Lingkungan', 'Kesehatan Masyarakat', 'Media dan Informasi', 'Ekonomi Kreatif', 'Pendidikan', 'Hubungan Eksternal'],
    unugiri: ['BPH', 'Media Informasi', 'Lingkungan Hidup', 'Kewirausahaan', 'Sosial Masyarakat', 'Pendidikan'],
    upnvjt: ['Ekonomi Kreatif', 'Pendidikan', 'Pengembangan Sumber Daya Mahasiswa', 'BPH', 'Media Komunikasi', 'Sosial Lingkungan', 'Hubungan Eksternal'],
    utm: ['Ekonomi Kreatif', 'Lingkungan Hidup', 'BPH', 'Publication & Public Relation', 'Pendidikan', 'Pengembangan Sumber Daya Mahasiswa', 'Sosial Masyarakat'],
};
const COMMISSARIAT_ALIASES = {
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
const SCOPED_DIVISION_ALIASES = {
    [`pens|${exports.MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup & sosial`]: 'Lingkungan Hidup & Sosial',
    [`unesa|${exports.MEMBERSHIP_RELEASE_PERIOD}|sosial dan linkungan`]: 'Sosial dan Lingkungan',
    [`upnvjt|${exports.MEMBERSHIP_RELEASE_PERIOD}|sosial linkungan`]: 'Sosial Lingkungan',
    [`uinsa|${exports.MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup`]: 'Lingkungan Hidup',
    [`utm|${exports.MEMBERSHIP_RELEASE_PERIOD}|linkungan hidup`]: 'Lingkungan Hidup',
    [`unugiri|${exports.MEMBERSHIP_RELEASE_PERIOD}|bph 1`]: 'BPH',
    [`unugiri|${exports.MEMBERSHIP_RELEASE_PERIOD}|bph 2`]: 'BPH',
    [`unugiri|${exports.MEMBERSHIP_RELEASE_PERIOD}|bph 3`]: 'BPH',
    [`unair|${exports.MEMBERSHIP_RELEASE_PERIOD}|media komunikasi; hubungan luar`]: 'Media Komunikasi & Hubungan Luar',
};
const canonicalCommissariatSlug = (value) => {
    const normalized = String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
    return COMMISSARIAT_ALIASES[normalized] ?? null;
};
exports.canonicalCommissariatSlug = canonicalCommissariatSlug;
const normalizeMembershipDivision = (value, scope) => {
    const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!normalized)
        return null;
    if (!scope?.commissariatSlug || !scope.periodLabel)
        return normalized;
    if (scope.commissariatSlug === 'unugiri' && scope.periodLabel === exports.MEMBERSHIP_RELEASE_PERIOD && /^bph [123]$/i.test(normalized))
        return 'BPH';
    return SCOPED_DIVISION_ALIASES[`${scope.commissariatSlug}|${scope.periodLabel}|${normalized.toLowerCase()}`] ?? normalized;
};
exports.normalizeMembershipDivision = normalizeMembershipDivision;
