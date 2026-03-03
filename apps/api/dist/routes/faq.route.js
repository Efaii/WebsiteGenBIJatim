"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faq_controller_1 = require("../controllers/faq.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply verifyToken middleware to all FAQ management routes
router.get('/', auth_middleware_1.verifyToken, faq_controller_1.getAdminFaqs);
router.post('/', auth_middleware_1.verifyToken, faq_controller_1.createFaq);
router.put('/:id', auth_middleware_1.verifyToken, faq_controller_1.updateFaq);
router.delete('/:id', auth_middleware_1.verifyToken, faq_controller_1.deleteFaq);
exports.default = router;
