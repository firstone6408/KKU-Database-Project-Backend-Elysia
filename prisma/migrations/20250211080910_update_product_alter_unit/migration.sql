-- AlterTable
ALTER TABLE `product` ADD COLUMN `unit` ENUM('METER', 'PIECE') NOT NULL DEFAULT 'PIECE';
