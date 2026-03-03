"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
// Public route for homepage
router.get('/latest', news_controller_1.getLatestNews);
// Admin Routes (Protected)
router.get('/', auth_middleware_1.verifyToken, news_controller_1.getAllNewsCountAndData);
router.post('/', auth_middleware_1.verifyToken, upload_middleware_1.uploadNewsImage.single('image'), news_controller_1.createNews);
router.put('/:id', auth_middleware_1.verifyToken, upload_middleware_1.uploadNewsImage.single('image'), news_controller_1.updateNews);
router.delete('/:id', auth_middleware_1.verifyToken, news_controller_1.deleteNews);
exports.default = router;
