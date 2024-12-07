/*
  Warnings:

  - Added the required column `productId` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stockhistory` ADD COLUMN `productId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `StockHistory` ADD CONSTRAINT `StockHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
