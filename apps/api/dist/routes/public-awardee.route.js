"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_awardee_controller_1 = require("../controllers/public-awardee.controller");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const router = (0, express_1.Router)();
router.get('/', (0, asyncHandler_1.asyncHandler)(public_awardee_controller_1.listPublicAwardees));
exports.default = router;
