/*
  Warnings:

  - Made the column `branchId` on table `stockinhistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `stockinhistory` DROP FOREIGN KEY `StockInHistory_branchId_fkey`;

-- AlterTable
ALTER TABLE `stockinhistory` MODIFY `branchId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `StockInHistory` ADD CONSTRAINT `StockInHistory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
