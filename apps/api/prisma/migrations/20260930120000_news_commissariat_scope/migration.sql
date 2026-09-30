-- AlterTable
ALTER TABLE `news` ADD COLUMN `commissariatId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `news_commissariatId_idx` ON `news`(`commissariatId`);

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_commissariatId_fkey` FOREIGN KEY (`commissariatId`) REFERENCES `commissariat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
