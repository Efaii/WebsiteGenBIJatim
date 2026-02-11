"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { Event, ProkerData } from '@repo/types';
const router = (0, express_1.Router)();
// Mock Data
const EVENTS_DATA = [
    {
        id: "2025-02-15-unair-workshop",
        title: "Workshop Digital Marketing",
        date: "15 Februari 2025",
        time: "09:00 - 15:00 WIB",
        location: "Aula FEB UNAIR",
        commissariat: "UNAIR",
        type: "Pelatihan",
        description: "Workshop intensif mengenai strategi pemasaran digital untuk UMKM binaan.",
        status: "Upcoming"
    },
    {
        id: "2025-03-01-its-technopreneur",
        title: "Technopreneur Summit 2025",
        date: "01 Maret 2025",
        time: "08:00 - 16:00 WIB",
        location: "Graha Sepuluh Nopember",
        commissariat: "ITS",
        type: "Webinar",
        description: "Seminar nasional menghadirkan pembicara dari unicorn Indonesia.",
        status: "Upcoming"
    }
];
router.get('/', (req, res) => {
    res.json(EVENTS_DATA);
});
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const event = EVENTS_DATA.find(e => e.id === id);
    if (event) {
        res.json(event);
    }
    else {
        res.status(404).json({ message: 'Event not found' });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map