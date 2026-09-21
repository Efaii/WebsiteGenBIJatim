-- Keep historical inactive assignments while enforcing one active assignment per CMS account.
ALTER TABLE `CmsAssignment`
  ADD COLUMN `activeAccountKey` VARCHAR(191) NULL;

UPDATE `CmsAssignment`
SET `activeAccountKey` = `cmsAccountId`
WHERE `active` = true;

CREATE UNIQUE INDEX `CmsAssignment_one_active_account_key`
  ON `CmsAssignment` (`activeAccountKey`);

CREATE TRIGGER `CmsAssignment_set_active_key_insert`
BEFORE INSERT ON `CmsAssignment`
FOR EACH ROW
SET NEW.`activeAccountKey` = IF(NEW.`active`, NEW.`cmsAccountId`, NULL);

CREATE TRIGGER `CmsAssignment_set_active_key_update`
BEFORE UPDATE ON `CmsAssignment`
FOR EACH ROW
SET NEW.`activeAccountKey` = IF(NEW.`active`, NEW.`cmsAccountId`, NULL);
