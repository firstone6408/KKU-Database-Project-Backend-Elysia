-- AlterTable
ALTER TABLE `order` MODIFY `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'OTHER', 'CANCELED') NULL;
