"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protect the dashboard stats endpoint
router.get('/stats', auth_middleware_1.verifyToken, dashboard_controller_1.getDashboardStats);
exports.default = router;
