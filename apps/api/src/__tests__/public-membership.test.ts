import assert from 'node:assert/strict';
import { projectPublicAwardee, projectPublicMembership } from '../domain/public-membership';

const record = {
  id: 'membership-1',
  name: 'Alya Callysta Nugraha',
  position: 'Wakil Ketua Divisi',
  studyProgram: 'S1 Sistem Informasi',
  division: { name: 'Hubungan Masyarakat' },
  commissariat: { slug: 'its', name: 'ITS' },
  period: { label: '2025/2026' },
};

assert.deepEqual(projectPublicMembership(record), {
  id: 'membership-1',
  name: 'Alya Callysta Nugraha',
  position: 'Wakil Ketua Divisi',
  studyProgram: 'S1 Sistem Informasi',
  division: 'Hubungan Masyarakat',
  commissariat: { slug: 'its', name: 'ITS' },
  period: '2025/2026',
});

assert.deepEqual(projectPublicAwardee(record), {
  id: 'membership-1',
  name: 'Alya Callysta Nugraha',
  position: 'Wakil Ketua Divisi',
  major: 'S1 Sistem Informasi',
  division: 'Hubungan Masyarakat',
  commissariat: { slug: 'its', name: 'ITS' },
  period: '2025/2026',
});

const privateRecord = { ...record, publicationStatus: 'PUBLISHED', membershipStatus: 'ACTIVE' };
assert.equal('publicationStatus' in projectPublicAwardee(privateRecord), false);
assert.equal('membershipStatus' in projectPublicAwardee(privateRecord), false);
assert.equal(projectPublicMembership({ ...record, division: null }).division, '-');
