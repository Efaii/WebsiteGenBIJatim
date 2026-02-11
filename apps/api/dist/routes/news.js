"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Mock Data (temporarily duplicated from frontend until DB is up)
const NEWS_DATA = [
    {
        id: 1,
        title: "Partisipasi GenBI Jatim dalam Sosialisasi QRIS Nasional",
        category: "Kegiatan",
        date: "24 Desember 2024",
        image_color: "bg-blue-100",
        snippet: "GenBI Jatim turut serta dalam upaya Bank Indonesia memperluas akseptasi digital di kalangan UMKM...",
    },
    {
        id: 2,
        title: "Webinar Nasional: Tantangan Ekonomi Digital 2025",
        category: "Webinar",
        date: "20 Desember 2024",
        image_color: "bg-purple-100",
        snippet: "Membahas peluang dan tantangan yang dihadapi generasi muda dalam era transformasi digital...",
    },
    {
        id: 3,
        title: "GenBI Peduli: Penanaman 1000 Mangrove di Surabaya",
        category: "Sosial",
        date: "15 Desember 2024",
        image_color: "bg-green-100",
        snippet: "Aksi nyata kepedulian lingkungan yang dilakukan oleh anggota GenBI dari berbagai komisariat...",
    },
];
router.get('/', (req, res) => {
    res.json(NEWS_DATA);
});
router.get('/:slug', (req, res) => {
    const { slug } = req.params;
    const news = NEWS_DATA.find((item) => {
        const itemSlug = item.title.toLowerCase().replace(/ /g, "-");
        return itemSlug === slug;
    });
    if (news) {
        res.json(news);
    }
    else {
        res.status(404).json({ message: 'News not found' });
    }
});
exports.default = router;
//# sourceMappingURL=news.js.map