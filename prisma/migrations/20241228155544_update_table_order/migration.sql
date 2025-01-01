/*
  Warnings:

  - A unique constraint covering the columns `[customerId,userId,branchId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_paymentOrderId_fkey`;

-- DropIndex
DROP INDEX `Order_paymentOrderId_customerId_userId_branchId_key` ON `order`;

-- AlterTable
ALTER TABLE `order` MODIFY `paymentOrderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_customerId_userId_branchId_key` ON `Order`(`customerId`, `userId`, `branchId`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_paymentOrderId_fkey` FOREIGN KEY (`paymentOrderId`) REFERENCES `PaymentOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
