"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicProfile = void 0;
const BPH_DATA = [
    {
        role: "Ketua Umum",
        name: "Fathir",
        university: "Universitas Airlangga",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Wakil Ketua",
        name: "Alya",
        university: "Institut Teknologi Sepuluh Nopember",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Sekretaris",
        name: "Budi",
        university: "Universitas Brawijaya",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Bendahara",
        name: "Siti",
        university: "Universitas Negeri Malang",
        image: "/assets/images/profile-placeholder.jpg",
    },
];
const DIVISIONS_DATA = [
    {
        role: "Kadiv Pendidikan",
        name: "Andi",
        university: "Universitas Negeri Surabaya",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Kadiv Lingkungan",
        name: "Dewi",
        university: "Universitas Trunojoyo Madura",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Kadiv Kesehatan",
        name: "Rizky",
        university: "Universitas Jember",
        image: "/assets/images/profile-placeholder.jpg",
    },
    {
        role: "Kadiv Kewirausahaan",
        name: "Putri",
        university: "UPN Veteran Jawa Timur",
        image: "/assets/images/profile-placeholder.jpg",
    },
];
const MOCK_PROFILE = {
    name: "GenBI Koordinator Komisariat Jawa Timur",
    university: "Jawa Timur",
    description: "GenBI Jatim adalah komunitas penerima beasiswa Bank Indonesia di wilayah Jawa Timur, yang berkomitmen untuk menjadi garda terdepan dalam mengkomunikasikan kebijakan Bank Indonesia dan berkontribusi bagi masyarakat.",
    vision: "Menjadi komunitas penerima beasiswa yang unggul, berdaya saing, dan berkontribusi nyata bagi pembangunan ekonomi negeri.",
    bph: BPH_DATA,
    divisions: DIVISIONS_DATA,
    documents: [
        {
            id: 1,
            title: "SK Pengurus Wilayah GenBI Jatim 2025-2026",
            fileType: "PDF",
            date: "10 Jan 2025",
            size: "2.4 MB",
            url: "#",
            type: "SK"
        },
        {
            id: 2,
            title: "Grand Design GenBI Jatim 2025",
            fileType: "PDF",
            date: "15 Jan 2025",
            size: "5.1 MB",
            url: "#",
            type: "Materi"
        }
    ]
};
const getPublicProfile = async () => {
    // Simulate DB fetch delay if needed, or simply return mock data for now
    return Promise.resolve(MOCK_PROFILE);
};
exports.getPublicProfile = getPublicProfile;
