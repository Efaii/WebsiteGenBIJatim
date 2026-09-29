"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_structure_controller_1 = require("../controllers/public-structure.controller");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const router = (0, express_1.Router)();
router.get('/:slug/structure', (0, asyncHandler_1.asyncHandler)(public_structure_controller_1.getCommissariatStructure));
exports.default = router;
