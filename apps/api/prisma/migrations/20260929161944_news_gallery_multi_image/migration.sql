-- AlterTable
ALTER TABLE `newscoverasset` ADD COLUMN `role` ENUM('COVER', 'GALLERY') NOT NULL DEFAULT 'GALLERY',
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `NewsCoverAsset_newsId_status_sortOrder_idx` ON `NewsCoverAsset`(`newsId`, `status`, `sortOrder`);
