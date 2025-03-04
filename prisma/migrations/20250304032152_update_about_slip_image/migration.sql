/*
  Warnings:

  - You are about to drop the column `slipImage` on the `paymentorder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentorder` DROP COLUMN `slipImage`;

-- CreateTable
CREATE TABLE `PaymentOrderSlip` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `paymentOrderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentOrderSlip_imageUrl_key`(`imageUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentOrderSlip` ADD CONSTRAINT `PaymentOrderSlip_paymentOrderId_fkey` FOREIGN KEY (`paymentOrderId`) REFERENCES `PaymentOrder`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;
