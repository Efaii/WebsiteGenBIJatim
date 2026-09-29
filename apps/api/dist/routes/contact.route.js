"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const router = (0, express_1.Router)();
router.post('/', (0, asyncHandler_1.asyncHandler)(contact_controller_1.createContactMessage));
exports.default = router;
