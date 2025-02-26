/*
  Warnings:

  - You are about to drop the column `createdAt` on the `delivery` table. All the data in the column will be lost.
  - Added the required column `sendDate` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `delivery` DROP COLUMN `createdAt`,
    ADD COLUMN `sendDate` DATETIME(3) NOT NULL;
