"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const cms_assignment_service_1 = require("../services/cms-assignment.service");
const prisma_1 = require("../lib/prisma");
const run = async () => {
    const account = await prisma_1.prisma.cmsAccount.findFirst();
    if (!account)
        return;
    const existing = await prisma_1.prisma.cmsAssignment.findFirst({ where: { cmsAccountId: account.id, active: true } });
    if (existing)
        await strict_1.default.rejects(() => (0, cms_assignment_service_1.assertOneActiveAssignment)(account.id));
};
run().catch((error) => { console.error(error); process.exit(1); });
