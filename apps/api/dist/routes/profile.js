"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
];
router.get('/', (req, res) => {
    res.json({
        name: "GenBI Koordinator Komisariat Jawa Timur",
        university: "Jawa Timur",
        description: "GenBI Jatim adalah komunitas penerima beasiswa Bank Indonesia di wilayah Jawa Timur, yang berkomitmen untuk menjadi garda terdepan dalam mengkomunikasikan kebijakan Bank Indonesia dan berkontribusi bagi masyarakat.",
        vision: "Menjadi komunitas penerima beasiswa yang unggul, berdaya saing, dan berkontribusi nyata bagi pembangunan ekonomi negeri.",
        bph: BPH_DATA,
        divisions: BPH_DATA, // Mocking divisions with same data for now
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
    });
});
exports.default = router;
//# sourceMappingURL=profile.js.map