"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
/**
 * @route profile.route
 * @description Public read-only routes for organization profile data.
 */
const router = (0, express_1.Router)();
router.get('/', profile_controller_1.getPublicProfile);
exports.default = router;
