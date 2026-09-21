if (process.env.ALLOW_STAGING_RESET !== 'true' || process.env.NODE_ENV !== 'staging' || !process.env.BACKUP_EVIDENCE_ID?.trim()) {
  throw new Error('Refusing staging reset: require NODE_ENV=staging, ALLOW_STAGING_RESET=true, and BACKUP_EVIDENCE_ID.');
}
console.log(`Staging reset guard passed with backup evidence ${process.env.BACKUP_EVIDENCE_ID}`);
