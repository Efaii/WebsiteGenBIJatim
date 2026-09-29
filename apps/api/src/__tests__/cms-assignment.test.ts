import assert from 'node:assert/strict';
import { assertOneActiveAssignment } from '../services/cms-assignment.service';
import { prisma } from '../lib/prisma';

const run = async () => {
  const account = await prisma.cmsAccount.findFirst();
  if (!account) return;
  const existing = await prisma.cmsAssignment.findFirst({ where: { cmsAccountId: account.id, active: true } });
  if (existing) await assert.rejects(() => assertOneActiveAssignment(account.id));
};

run().catch((error) => { console.error(error); process.exit(1); });
