"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const public_membership_1 = require("../domain/public-membership");
const record = {
    id: 'membership-1',
    name: 'Alya Callysta Nugraha',
    position: 'Wakil Ketua Divisi',
    studyProgram: 'S1 Sistem Informasi',
    division: { name: 'Hubungan Masyarakat' },
    commissariat: { slug: 'its', name: 'ITS' },
    period: { label: '2025/2026' },
};
strict_1.default.deepEqual((0, public_membership_1.projectPublicMembership)(record), {
    id: 'membership-1',
    name: 'Alya Callysta Nugraha',
    position: 'Wakil Ketua Divisi',
    studyProgram: 'S1 Sistem Informasi',
    division: 'Hubungan Masyarakat',
    commissariat: { slug: 'its', name: 'ITS' },
    period: '2025/2026',
});
strict_1.default.deepEqual((0, public_membership_1.projectPublicAwardee)(record), {
    id: 'membership-1',
    name: 'Alya Callysta Nugraha',
    position: 'Wakil Ketua Divisi',
    studyProgram: 'S1 Sistem Informasi',
    division: 'Hubungan Masyarakat',
    commissariat: { slug: 'its', name: 'ITS' },
    period: '2025/2026',
});
const privateRecord = { ...record, publicationStatus: 'PUBLISHED', membershipStatus: 'ACTIVE' };
strict_1.default.equal('publicationStatus' in (0, public_membership_1.projectPublicAwardee)(privateRecord), false);
strict_1.default.equal('membershipStatus' in (0, public_membership_1.projectPublicAwardee)(privateRecord), false);
strict_1.default.equal((0, public_membership_1.projectPublicMembership)({ ...record, division: null }).division, '-');
