-- AlterTable
ALTER TABLE `Commissariat` ADD COLUMN `coverImage` VARCHAR(191) NOT NULL DEFAULT '/assets/images/raker.jpg',
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `instagram` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `logoGenbi` VARCHAR(191) NOT NULL DEFAULT '/assets/logos/genbi.svg',
    ADD COLUMN `memberCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `university` VARCHAR(191) NULL;

UPDATE `Commissariat`
SET `description` = COALESCE(NULLIF(`description`, ''), `name`),
    `university` = COALESCE(NULLIF(`university`, ''), `name`),
    `slug` = COALESCE(NULLIF(`slug`, ''), CONCAT('legacy-', LOWER(REPLACE(`id`, '-', ''))))
WHERE `description` IS NULL OR `university` IS NULL OR `slug` IS NULL;

UPDATE `Commissariat` c
JOIN (
    SELECT `slug`, MIN(`id`) AS `firstId`
    FROM `Commissariat`
    GROUP BY `slug`
    HAVING COUNT(*) > 1
) collisions ON collisions.`slug` = c.`slug`
SET c.`slug` = CONCAT('legacy-', LOWER(REPLACE(c.`id`, '-', '')))
WHERE c.`id` <> collisions.`firstId`;

ALTER TABLE `Commissariat`
    MODIFY `description` TEXT NOT NULL,
    MODIFY `slug` VARCHAR(191) NOT NULL,
    MODIFY `university` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `CmsAccount` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN_GLOBAL', 'SEKRETARIS_UMUM', 'SEKRETARIS_DIVISI') NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CmsAccount_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Period` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Period_label_idx`(`label`),
    UNIQUE INDEX `Period_commissariatId_label_key`(`commissariatId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Division` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Division_periodId_idx`(`periodId`),
    UNIQUE INDEX `Division_commissariatId_periodId_name_key`(`commissariatId`, `periodId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembershipImportAlias` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `rawValue` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NULL,
    `periodId` VARCHAR(191) NULL,
    `divisionId` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MembershipImportAlias_kind_rawValue_approved_idx`(`kind`, `rawValue`, `approved`),
    UNIQUE INDEX `MembershipImportAlias_kind_rawValue_commissariatId_periodId_key`(`kind`, `rawValue`, `commissariatId`, `periodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Membership` (
    `id` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `divisionId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `studyProgram` VARCHAR(191) NOT NULL,
    `publicationStatus` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `membershipStatus` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Membership_commissariatId_periodId_idx`(`commissariatId`, `periodId`),
    INDEX `Membership_divisionId_idx`(`divisionId`),
    INDEX `Membership_publicationStatus_membershipStatus_idx`(`publicationStatus`, `membershipStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembershipImportPreview` (
    `id` VARCHAR(191) NOT NULL,
    `cmsAccountId` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `sourceFilename` VARCHAR(191) NOT NULL,
    `sourceFileHash` VARCHAR(191) NOT NULL,
    `status` ENUM('PREVIEW_READY', 'COMMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'STALE', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'PREVIEW_READY',
    `totalRows` INTEGER NOT NULL,
    `newCount` INTEGER NOT NULL DEFAULT 0,
    `updatedCount` INTEGER NOT NULL DEFAULT 0,
    `unchangedCount` INTEGER NOT NULL DEFAULT 0,
    `invalidCount` INTEGER NOT NULL DEFAULT 0,
    `ambiguousCount` INTEGER NOT NULL DEFAULT 0,
    `duplicateCount` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,
    `committedAt` DATETIME(3) NULL,
    `finalReport` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MembershipImportPreview_cmsAccountId_status_expiresAt_idx`(`cmsAccountId`, `status`, `expiresAt`),
    INDEX `MembershipImportPreview_commissariatId_periodId_createdAt_idx`(`commissariatId`, `periodId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembershipImportRow` (
    `id` VARCHAR(191) NOT NULL,
    `previewId` VARCHAR(191) NOT NULL,
    `rowNumber` INTEGER NOT NULL,
    `rawValues` JSON NOT NULL,
    `normalizedValues` JSON NULL,
    `classification` ENUM('NEW', 'UPDATED', 'UNCHANGED', 'INVALID', 'AMBIGUOUS_MATCH', 'DUPLICATE_IN_FILE') NOT NULL,
    `errorCode` VARCHAR(191) NULL,
    `errorMessage` VARCHAR(191) NULL,
    `matchedMembershipId` VARCHAR(191) NULL,
    `mappedDivisionId` VARCHAR(191) NULL,
    `baselineUpdatedAt` DATETIME(3) NULL,
    `createdMembershipId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MembershipImportRow_previewId_classification_idx`(`previewId`, `classification`),
    UNIQUE INDEX `MembershipImportRow_previewId_rowNumber_key`(`previewId`, `rowNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `cmsAccountId` VARCHAR(191) NOT NULL,
    `commissariatId` VARCHAR(191) NULL,
    `periodId` VARCHAR(191) NULL,
    `divisionId` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CmsAssignment_commissariatId_periodId_divisionId_idx`(`commissariatId`, `periodId`, `divisionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CmsSession` (
    `id` VARCHAR(191) NOT NULL,
    `cmsAccountId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CmsSession_tokenHash_key`(`tokenHash`),
    INDEX `CmsSession_cmsAccountId_revokedAt_expiresAt_idx`(`cmsAccountId`, `revokedAt`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` VARCHAR(191) NOT NULL,
    `cmsAccountId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `oldStatus` VARCHAR(191) NULL,
    `newStatus` VARCHAR(191) NULL,
    `commissariatId` VARCHAR(191) NULL,
    `periodId` VARCHAR(191) NULL,
    `divisionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditEvent_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditEvent_cmsAccountId_createdAt_idx`(`cmsAccountId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_kerja` (
    `id` VARCHAR(191) NOT NULL,
    `programKe` INTEGER NOT NULL,
    `namaProker` VARCHAR(191) NOT NULL,
    `divisi` VARCHAR(191) NOT NULL,
    `tanggalProker` DATETIME(3) NOT NULL,
    `formatPelaksanaan` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `deskripsiProker` TEXT NOT NULL,
    `kpiTukTarget` TEXT NULL,
    `dampak` TEXT NULL,
    `evaluasi` TEXT NULL,
    `foto1` VARCHAR(191) NULL,
    `foto2` VARCHAR(191) NULL,
    `foto3` VARCHAR(191) NULL,
    `foto4` VARCHAR(191) NULL,
    `foto5` VARCHAR(191) NULL,
    `foto6` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `commissariatId` VARCHAR(191) NOT NULL,

    INDEX `program_kerja_commissariatId_idx`(`commissariatId`),
    INDEX `program_kerja_tanggalProker_idx`(`tanggalProker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(280) NOT NULL DEFAULT '',
    `category` ENUM('KEGIATAN', 'WEBINAR', 'SOSIAL', 'EDUKASI', 'PELATIHAN') NULL,
    `publicationStatus` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `authorAccountId` VARCHAR(191) NULL,
    `rejectionReason` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsRevision` (
    `id` VARCHAR(191) NOT NULL,
    `newsId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(280) NOT NULL,
    `content` TEXT NOT NULL,
    `category` ENUM('KEGIATAN', 'WEBINAR', 'SOSIAL', 'EDUKASI', 'PELATIHAN') NULL,
    `publicationStatus` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NewsRevision_newsId_publicationStatus_idx`(`newsId`, `publicationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsCoverAsset` (
    `id` VARCHAR(191) NOT NULL,
    `newsId` VARCHAR(191) NULL,
    `revisionId` VARCHAR(191) NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `originalFilename` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `visibility` VARCHAR(191) NOT NULL DEFAULT 'STAGED',
    `status` ENUM('STAGED', 'PUBLIC', 'SUPERSEDED') NOT NULL DEFAULT 'STAGED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supersededAt` DATETIME(3) NULL,

    UNIQUE INDEX `NewsCoverAsset_storageKey_key`(`storageKey`),
    INDEX `NewsCoverAsset_newsId_status_idx`(`newsId`, `status`),
    INDEX `NewsCoverAsset_revisionId_status_idx`(`revisionId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsSlugAlias` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `newsId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NewsSlugAlias_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Commissariat_slug_key` ON `Commissariat`(`slug`);

-- AddForeignKey
ALTER TABLE `CmsAccount` ADD CONSTRAINT `CmsAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Period` ADD CONSTRAINT `Period_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Division` ADD CONSTRAINT `Division_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Division` ADD CONSTRAINT `Division_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportAlias` ADD CONSTRAINT `MembershipImportAlias_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportAlias` ADD CONSTRAINT `MembershipImportAlias_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportAlias` ADD CONSTRAINT `MembershipImportAlias_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `Division`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Membership` ADD CONSTRAINT `Membership_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Membership` ADD CONSTRAINT `Membership_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Membership` ADD CONSTRAINT `Membership_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `Division`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportPreview` ADD CONSTRAINT `MembershipImportPreview_cmsAccountId_fkey` FOREIGN KEY (`cmsAccountId`) REFERENCES `CmsAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportPreview` ADD CONSTRAINT `MembershipImportPreview_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportPreview` ADD CONSTRAINT `MembershipImportPreview_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportRow` ADD CONSTRAINT `MembershipImportRow_previewId_fkey` FOREIGN KEY (`previewId`) REFERENCES `MembershipImportPreview`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MembershipImportRow` ADD CONSTRAINT `MembershipImportRow_matchedMembershipId_fkey` FOREIGN KEY (`matchedMembershipId`) REFERENCES `Membership`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsAssignment` ADD CONSTRAINT `CmsAssignment_cmsAccountId_fkey` FOREIGN KEY (`cmsAccountId`) REFERENCES `CmsAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsAssignment` ADD CONSTRAINT `CmsAssignment_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsAssignment` ADD CONSTRAINT `CmsAssignment_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsAssignment` ADD CONSTRAINT `CmsAssignment_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `Division`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CmsSession` ADD CONSTRAINT `CmsSession_cmsAccountId_fkey` FOREIGN KEY (`cmsAccountId`) REFERENCES `CmsAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditEvent` ADD CONSTRAINT `AuditEvent_cmsAccountId_fkey` FOREIGN KEY (`cmsAccountId`) REFERENCES `CmsAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `Commissariat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_authorAccountId_fkey` FOREIGN KEY (`authorAccountId`) REFERENCES `CmsAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsRevision` ADD CONSTRAINT `NewsRevision_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsCoverAsset` ADD CONSTRAINT `NewsCoverAsset_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsCoverAsset` ADD CONSTRAINT `NewsCoverAsset_revisionId_fkey` FOREIGN KEY (`revisionId`) REFERENCES `NewsRevision`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsSlugAlias` ADD CONSTRAINT `NewsSlugAlias_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;