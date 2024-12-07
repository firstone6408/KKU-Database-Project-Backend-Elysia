/*
  Warnings:

  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderStatus` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'OTHER') NOT NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING';
