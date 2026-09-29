"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const master_controller_1 = require("../controllers/master.controller");
const router = (0, express_1.Router)();
router.get('/', (0, asyncHandler_1.asyncHandler)(master_controller_1.getCanonicalMasters));
exports.default = router;
