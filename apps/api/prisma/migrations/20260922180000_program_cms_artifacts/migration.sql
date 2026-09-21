ALTER TABLE `program_kerja`
  ADD COLUMN `periodId` VARCHAR(191) NULL,
  ADD COLUMN `divisionId` VARCHAR(191) NULL,
  ADD COLUMN `publicationStatus` ENUM('DRAFT','SUBMITTED','APPROVED','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN `rejectionReason` TEXT NULL,
  ADD COLUMN `authorAccountId` VARCHAR(191) NULL;

CREATE TABLE `ProgramKerjaRevision` (
  `id` VARCHAR(191) NOT NULL,
  `programKerjaId` VARCHAR(191) NOT NULL,
  `namaProker` VARCHAR(191) NOT NULL,
  `divisi` VARCHAR(191) NOT NULL,
  `tanggalProker` DATETIME(3) NOT NULL,
  `formatPelaksanaan` VARCHAR(191) NOT NULL,
  `deskripsiProker` TEXT NOT NULL,
  `publicationStatus` ENUM('DRAFT','SUBMITTED','APPROVED','PUBLISHED','REJECTED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `rejectionReason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), INDEX `ProgramKerjaRevision_programKerjaId_publicationStatus_idx` (`programKerjaId`,`publicationStatus`),
  CONSTRAINT `ProgramKerjaRevision_programKerjaId_fkey` FOREIGN KEY (`programKerjaId`) REFERENCES `program_kerja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProgramArtifact` (
  `id` VARCHAR(191) NOT NULL,
  `programKerjaId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(191) NOT NULL,
  `storageKey` VARCHAR(191) NOT NULL,
  `originalFilename` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `byteSize` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE INDEX `ProgramArtifact_storageKey_key` (`storageKey`), INDEX `ProgramArtifact_programKerjaId_kind_idx` (`programKerjaId`,`kind`),
  CONSTRAINT `ProgramArtifact_programKerjaId_fkey` FOREIGN KEY (`programKerjaId`) REFERENCES `program_kerja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `program_kerja_periodId_idx` ON `program_kerja`(`periodId`);
CREATE INDEX `program_kerja_divisionId_idx` ON `program_kerja`(`divisionId`);
ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `division`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `program_kerja` ADD CONSTRAINT `program_kerja_authorAccountId_fkey` FOREIGN KEY (`authorAccountId`) REFERENCES `cmsaccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
