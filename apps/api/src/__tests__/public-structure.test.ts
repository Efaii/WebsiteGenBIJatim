import assert from 'node:assert/strict';
import { buildPublicStructure } from '../domain/public-structure';

const structure = buildPublicStructure([
  { name: 'Zed', position: 'Ketua', division: { name: 'BPH' } },
  { name: 'Amy', position: 'Sekretaris', division: { name: 'BPH' } },
  { name: 'Budi', position: 'Anggota', division: { name: 'Pendidikan' } },
  { name: 'Ani', position: 'Koordinator', division: { name: 'Pendidikan' } },
  { name: 'NoDiv', position: 'Staff', division: null },
  { name: 'Blank', position: 'Staff', division: { name: '   ' } },
]);

assert.deepEqual(structure.bph, [
  { name: 'Amy', position: 'Sekretaris' },
  { name: 'Zed', position: 'Ketua' },
]);

assert.deepEqual(structure.divisions, [
  {
    name: 'Pendidikan',
    members: [
      { name: 'Ani', position: 'Koordinator' },
      { name: 'Budi', position: 'Anggota' },
    ],
  },
]);

assert.deepEqual(buildPublicStructure([]), { bph: [], divisions: [] });
assert.deepEqual(buildPublicStructure([{ name: 'X', position: 'Staff', division: null }]), {
  bph: [],
  divisions: [],
});

console.log('All public-structure assertions passed successfully!');
