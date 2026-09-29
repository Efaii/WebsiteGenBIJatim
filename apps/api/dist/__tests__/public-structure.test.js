"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const public_structure_1 = require("../domain/public-structure");
const structure = (0, public_structure_1.buildPublicStructure)([
    { name: 'Zed', position: 'Ketua', division: { name: 'BPH' } },
    { name: 'Amy', position: 'Sekretaris', division: { name: 'BPH' } },
    { name: 'Budi', position: 'Anggota', division: { name: 'Pendidikan' } },
    { name: 'Ani', position: 'Koordinator', division: { name: 'Pendidikan' } },
    { name: 'NoDiv', position: 'Staff', division: null },
    { name: 'Blank', position: 'Staff', division: { name: '   ' } },
]);
strict_1.default.deepEqual(structure.bph, [
    { name: 'Amy', position: 'Sekretaris' },
    { name: 'Zed', position: 'Ketua' },
]);
strict_1.default.deepEqual(structure.divisions, [
    {
        name: 'Pendidikan',
        members: [
            { name: 'Ani', position: 'Koordinator' },
            { name: 'Budi', position: 'Anggota' },
        ],
    },
]);
strict_1.default.deepEqual((0, public_structure_1.buildPublicStructure)([]), { bph: [], divisions: [] });
strict_1.default.deepEqual((0, public_structure_1.buildPublicStructure)([{ name: 'X', position: 'Staff', division: null }]), {
    bph: [],
    divisions: [],
});
console.log('All public-structure assertions passed successfully!');
