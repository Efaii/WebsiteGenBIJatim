"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const DOCUMENTS_DATA = [
    {
        id: 1,
        title: "Panduan Beasiswa Bank Indonesia 2024",
        type: "Materi",
        fileType: "PDF",
        size: "2.5 MB",
        date: "10 Jan 2024",
        category: "Panduan",
    },
    {
        id: 2,
        title: "Template Laporan Kegiatan Komisariat",
        type: "Dokumentasi", // Or 'Data'
        fileType: "DOCX",
        size: "1.2 MB",
        date: "15 Jan 2024",
        category: "Template",
    },
    {
        id: 3,
        title: "SOP Pengajuan Dana Program Kerja",
        type: "SOP",
        fileType: "PDF",
        size: "1.8 MB",
        date: "20 Jan 2024",
        category: "SOP",
    },
];
router.get('/', (req, res) => {
    res.json(DOCUMENTS_DATA);
});
exports.default = router;
//# sourceMappingURL=docs.js.map