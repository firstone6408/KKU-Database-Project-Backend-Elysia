-- AlterTable
ALTER TABLE `stockhistory` MODIFY `type` ENUM('ADD', 'REMOVE', 'TRANSFER', 'ADJUST', 'CANCELED') NOT NULL;
