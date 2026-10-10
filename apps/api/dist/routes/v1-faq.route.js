"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const cms_session_middleware_1 = require("../middlewares/cms-session.middleware");
const v1_faq_controller_1 = require("../controllers/v1-faq.controller");
/*
 * FAQ v1: baca publik (aktif, urut), tulis hanya admin global.
 */
const router = (0, express_1.Router)();
router.get("/", (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.listPublicFaqs));
router.get("/cms", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.listCmsFaqs));
router.post("/", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.createFaq));
router.post("/order", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.orderFaqs));
router.patch("/:id", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.updateFaq));
router.delete("/:id", cms_session_middleware_1.requireCmsSession, (0, cms_session_middleware_1.requireCmsRole)(client_1.CmsRole.ADMIN_GLOBAL), (0, asyncHandler_1.asyncHandler)(v1_faq_controller_1.deleteFaq));
exports.default = router;
