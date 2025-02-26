/*
  Warnings:

  - The values [DEPOSITED,CREDIT_USED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `type` ENUM('FULL_PAYMENT', 'DEPOSITED', 'CREDIT_USED', 'DEPOSITED_CREDIT_USED') NOT NULL DEFAULT 'FULL_PAYMENT',
    MODIFY `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'DELIVERING') NOT NULL DEFAULT 'PENDING';
