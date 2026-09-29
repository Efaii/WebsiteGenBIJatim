"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commissariat_controller_1 = require("../controllers/commissariat.controller");
const router = (0, express_1.Router)();
// GET /api/commissariats — Semua komisariat
router.get('/', commissariat_controller_1.getAllCommissariats);
// GET /api/commissariats/stats — Statistik agregat
router.get('/stats', commissariat_controller_1.getCommissariatStats);
// GET /api/commissariats/proker — Semua program kerja
router.get('/proker', commissariat_controller_1.getAllProgramKerja);
// GET /api/commissariats/proker/:id — Detail satu program kerja
router.get('/proker/:id', commissariat_controller_1.getProgramKerjaById);
// GET /api/commissariats/:slug — Detail komisariat + proker
router.get('/:slug', commissariat_controller_1.getCommissariatBySlug);
exports.default = router;
