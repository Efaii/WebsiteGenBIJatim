"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const cms_program_status_1 = require("../domain/cms-program-status");
strict_1.default.equal((0, cms_program_status_1.cmsPublicationStatus)("ARCHIVED"), "ARCHIVED");
strict_1.default.equal((0, cms_program_status_1.cmsPublicationStatus)("PUBLISHED"), "PUBLISHED");
strict_1.default.equal((0, cms_program_status_1.cmsPublicationStatus)("archived"), undefined);
strict_1.default.equal((0, cms_program_status_1.cmsPublicationStatus)("UNKNOWN"), undefined);
strict_1.default.equal((0, cms_program_status_1.cmsPublicationStatus)(undefined), undefined);
