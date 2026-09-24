ALTER TABLE `program_kerja`
  MODIFY `tanggalProker` DATETIME(3) NULL,
  ADD COLUMN `dateLabel` VARCHAR(191) NULL;

ALTER TABLE `ProgramKerjaRevision`
  MODIFY `tanggalProker` DATETIME(3) NULL,
  ADD COLUMN `dateLabel` VARCHAR(191) NULL;

CREATE TABLE `program_kerja_photo` (
  `id` VARCHAR(191) NOT NULL,
  `programKerjaId` VARCHAR(191) NOT NULL,
  `filePath` VARCHAR(191) NOT NULL,
  `fileHash` VARCHAR(64) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `program_kerja_photo_programKerjaId_fileHash_key` (`programKerjaId`, `fileHash`),
  INDEX `program_kerja_photo_programKerjaId_createdAt_idx` (`programKerjaId`, `createdAt`),
  CONSTRAINT `program_kerja_photo_programKerjaId_fkey`
    FOREIGN KEY (`programKerjaId`) REFERENCES `program_kerja`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
