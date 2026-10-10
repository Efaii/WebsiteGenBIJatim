"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMembershipDivision = exports.canonicalCommissariatSlug = exports.MEMBERSHIP_RELEASE_DIVISIONS = exports.MEMBERSHIP_EXPECTED_NO_DIVISION_TOTAL = exports.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS = exports.MEMBERSHIP_EXPECTED_TOTAL = exports.MEMBERSHIP_EXPECTED_COUNTS = exports.MEMBERSHIP_RELEASE_COMMISSARIATS = exports.MEMBERSHIP_SOURCE_SHA256 = exports.MEMBERSHIP_RELEASE_PERIOD = void 0;
exports.MEMBERSHIP_RELEASE_PERIOD = '2025/2026';
exports.MEMBERSHIP_SOURCE_SHA256 = '231139a99cebb32504a131e70662d195be9e1aac30277fad1c5168fce47ad831';
exports.MEMBERSHIP_RELEASE_COMMISSARIATS = [
    { slug: 'its', name: 'ITS', university: 'Institut Teknologi Sepuluh Nopember', logo: '/assets/logos/its.webp', expectedCount: 87 },
    { slug: 'pens', name: 'PENS', university: 'Politeknik Elektronika Negeri Surabaya', logo: '/assets/logos/pens.webp', expectedCount: 48 },
    { slug: 'uin-madura', name: 'UIN Madura', university: 'UIN Madura', logo: '/assets/logos/uinMadura.webp', expectedCount: 50 },
    { slug: 'uinsa', name: 'UINSA', university: 'UIN Sunan Ampel Surabaya', logo: '/assets/logos/uinsa.webp', expectedCount: 83 },
    { slug: 'unair', name: 'UNAIR', university: 'Universitas Airlangga', logo: '/assets/logos/unair.webp', expectedCount: 114 },
    { slug: 'unesa', name: 'UNESA', university: 'Universitas Negeri Surabaya', logo: '/assets/logos/unesa.webp', expectedCount: 66 },
    { slug: 'unugiri', name: 'UNUGIRI', university: 'Universitas Nahdlatul Ulama Sunan Giri', logo: '/assets/logos/unugiri.webp', expectedCount: 50 },
    { slug: 'upnvjt', name: 'UPN Veteran Jatim', university: 'UPN Veteran Jawa Timur', logo: '/assets/logos/upnvjt.webp', expectedCount: 50 },
    { slug: 'utm', name: 'UTM', university: 'Universitas Trunojoyo Madura', logo: '/assets/logos/utm.webp', expectedCount: 75 },
];
exports.MEMBERSHIP_EXPECTED_COUNTS = Object.fromEntries(exports.MEMBERSHIP_RELEASE_COMMISSARIATS.map((item) => [item.slug, item.expectedCount]));
exports.MEMBERSHIP_EXPECTED_TOTAL = exports.MEMBERSHIP_RELEASE_COMMISSARIATS.reduce((total, item) => total + item.expectedCount, 0);
exports.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS = {
    its: 46,
    pens: 2,
    'uin-madura': 1,
    uinsa: 24,
    unair: 28,
    unesa: 0,
    unugiri: 0,
    upnvjt: 0,
    utm: 0,
};
exports.MEMBERSHIP_EXPECTED_NO_DIVISION_TOTAL = Object.values(exports.MEMBERSHIP_EXPECTED_NO_DIVISION_COUNTS).reduce((total, count) => total + count, 0);
exports.MEMBERSHIP_RELEASE_DIVISIONS = {
    its: ['Hubungan Masyarakat', 'Sosial dan Lingkungan', 'Media dan Publikasi', 'Pengembangan Organisasi', 'BPH'],
    pens: ['Media Informasi & Komunikasi', 'Lingkungan Hidup & Sosial', 'Kesehatan Masyarakat', 'Pengembangan Sumber Daya Mahasiswa', 'BPH', 'Ekonomi Kreatif', 'Pendidikan & Kreativitas'],
    'uin-madura': ['BPH', 'Lingkungan Hidup & Kesehatan Masyarakat', 'Kewirausahaan', 'Komunikasi & Informasi', 'Pendidikan'],
    uinsa: ['Media Informasi', 'Pendidikan', 'Pengembangan Sumber Daya Mahasiswa', 'Lingkungan Hidup', 'BPH', 'Pariwisata & Ekonomi Kreatif', 'Kesehatan & Sosial Masyarakat'],
    unair: ['Media Komunikasi', 'Ekonomi Kreatif', 'Hubungan Luar', 'Kontrol Mutu Internal', 'Pengembangan Sumber Daya Mahasiswa', 'Pengabdian Masyarakat', 'BPH', 'Pendidikan'],
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
