-- Keep historical inactive assignments while enforcing one active assignment per CMS account.
ALTER TABLE `CmsAssignment`
  ADD COLUMN `activeAccountKey` VARCHAR(191)
    GENERATED ALWAYS AS (IF(`active`, `cmsAccountId`, NULL)) STORED;

CREATE UNIQUE INDEX `CmsAssignment_one_active_account_key`
  ON `CmsAssignment` (`activeAccountKey`);
