/*
  Warnings:

  - You are about to drop the column `userId` on the `delivery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `delivery` DROP FOREIGN KEY `Delivery_userId_fkey`;

-- DropIndex
DROP INDEX `Delivery_userId_key` ON `delivery`;

-- AlterTable
ALTER TABLE `delivery` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `DeliveryDriver` (
    `deliveryId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`deliveryId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`orderId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
