-- CreateTable
CREATE TABLE `HomeHero` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `headingLine1` VARCHAR(120) NOT NULL,
    `headingLine2` VARCHAR(120) NOT NULL,
    `description` VARCHAR(400) NOT NULL,
    `videoEnabled` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeAbout` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `paragraphLead` VARCHAR(200) NOT NULL,
    `paragraph` TEXT NOT NULL,
    `emphasis` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomePilarCard` (
    `position` INTEGER NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `points` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`position`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeStoryMilestone` (
    `position` INTEGER NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`position`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeMediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `slot` VARCHAR(64) NOT NULL,
    `kind` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(300) NOT NULL DEFAULT '',
    `mimeType` VARCHAR(100) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `bytes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HomeMediaAsset_slot_key`(`slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
