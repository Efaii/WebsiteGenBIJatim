"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const cms_session_middleware_1 = require("../middlewares/cms-session.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const v1_home_controller_1 = require("../controllers/v1-home.controller");
/*
 * Konten Beranda v1: baca publik, tulis hanya admin global (ADR 0013/0014).
 */
const router = (0, express_1.Router)();
router.get("/", (0, asyncHandler_1.asyncHandler)(v1_home_controller_1.getHomeContent));
router.patch("/", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_home_controller_1.updateHomeContent));
router.post("/media/:slot", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), upload_middleware_1.uploadHomeMediaFile.single("file"), (0, asyncHandler_1.asyncHandler)(v1_home_controller_1.uploadHomeMedia));
router.delete("/media/:slot", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_home_controller_1.deleteHomeMedia));
exports.default = router;
