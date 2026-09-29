"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const membership_controller_1 = require("../controllers/membership.controller");
const router = (0, express_1.Router)();
router.get('/', (0, asyncHandler_1.asyncHandler)(membership_controller_1.listPublishedMemberships));
exports.default = router;
