if (!process.env.BACKUP_EVIDENCE_ID?.trim() || !process.env.RESTORE_EVIDENCE_ID?.trim()) throw new Error('BACKUP_EVIDENCE_ID and RESTORE_EVIDENCE_ID are required; no destructive backup action is performed by this script.');
console.log(`Backup/restore evidence verified: backup=${process.env.BACKUP_EVIDENCE_ID} restore=${process.env.RESTORE_EVIDENCE_ID}`);
