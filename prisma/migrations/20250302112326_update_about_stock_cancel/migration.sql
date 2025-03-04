-- AlterTable
ALTER TABLE `stockinhistory` ADD COLUMN `cancelNote` VARCHAR(191) NULL,
    ADD COLUMN `canceledAt` DATETIME(3) NULL,
    ADD COLUMN `canceledBy` VARCHAR(191) NULL,
    ADD COLUMN `isCanceled` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `StockInHistory` ADD CONSTRAINT `StockInHistory_canceledBy_fkey` FOREIGN KEY (`canceledBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
