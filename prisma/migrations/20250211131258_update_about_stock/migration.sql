/*
  Warnings:

  - You are about to drop the column `stockId` on the `stockinhistory` table. All the data in the column will be lost.
  - Added the required column `stockId` to the `StockInItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `stockinhistory` DROP FOREIGN KEY `StockInHistory_stockId_fkey`;

-- AlterTable
ALTER TABLE `stockinhistory` DROP COLUMN `stockId`;

-- AlterTable
ALTER TABLE `stockinitem` ADD COLUMN `stockId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `StockInItem` ADD CONSTRAINT `StockInItem_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
