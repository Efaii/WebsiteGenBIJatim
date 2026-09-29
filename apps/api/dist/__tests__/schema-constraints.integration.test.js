"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const prisma_1 = require("../lib/prisma");
const run = async () => {
    const suffix = `test-${Date.now()}`;
    const commissariat = await prisma_1.prisma.commissariat.create({ data: { slug: suffix, name: 'Test', university: 'Test', logo: 'test', description: 'test' } });
    try {
        const period = await prisma_1.prisma.period.create({ data: { label: '2099/2100', commissariatId: commissariat.id } });
        await prisma_1.prisma.division.create({ data: { name: 'Pendidikan', commissariatId: commissariat.id, periodId: period.id } });
        await strict_1.default.rejects(() => prisma_1.prisma.division.create({ data: { name: 'Pendidikan', commissariatId: commissariat.id, periodId: period.id } }));
        const membership = await prisma_1.prisma.membership.create({ data: { commissariatId: commissariat.id, periodId: period.id, name: 'Test', position: 'Staff', studyProgram: 'Test' } });
        strict_1.default.equal(membership.divisionId, null);
    }
    finally {
        await prisma_1.prisma.membership.deleteMany({ where: { commissariatId: commissariat.id } });
        await prisma_1.prisma.division.deleteMany({ where: { commissariatId: commissariat.id } });
        await prisma_1.prisma.period.deleteMany({ where: { commissariatId: commissariat.id } });
        await prisma_1.prisma.commissariat.delete({ where: { id: commissariat.id } });
    }
};
run().catch((error) => { console.error(error); process.exit(1); });
