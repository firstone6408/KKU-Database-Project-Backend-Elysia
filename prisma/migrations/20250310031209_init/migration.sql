-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Branch_branchCode_key`(`branchCode`),
    UNIQUE INDEX `Branch_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `profileImage` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'STAFF', 'TRANSPORTER') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `branchId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerGroup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustomerGroup_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `customerCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerGroupId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Customer_customerCode_key`(`customerCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `categoryCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_categoryCode_key`(`categoryCode`),
    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `productCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `unit` ENUM('METER', 'PIECE') NOT NULL DEFAULT 'PIECE',
    `categoryId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Product_barcode_key`(`barcode`),
    UNIQUE INDEX `Product_productCode_key`(`productCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Stock_productId_branchId_key`(`productId`, `branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockInHistory` (
    `id` VARCHAR(191) NOT NULL,
    `refCode` VARCHAR(191) NOT NULL,
    `distributor` VARCHAR(191) NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `type` ENUM('RETURN', 'ORDER', 'OTHER') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isCanceled` BOOLEAN NOT NULL DEFAULT false,
    `canceledAt` DATETIME(3) NULL,
    `cancelNote` VARCHAR(191) NULL,
    `canceledBy` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `StockInHistory_refCode_key`(`refCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockInItem` (
    `stockInHistoryId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `stockId` VARCHAR(191) NOT NULL,
    `costPrice` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `StockInItem_stockInHistoryId_productId_key`(`stockInHistoryId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockOutHistory` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `type` ENUM('SALE') NOT NULL,
    `note` VARCHAR(191) NULL,
    `sellPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `stockId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSaleBranch` (
    `sellPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ProductSaleBranch_productId_branchId_key`(`productId`, `branchId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderCode` VARCHAR(191) NOT NULL,
    `totalPrice` DOUBLE NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'DELIVERING', 'UNPAID') NOT NULL DEFAULT 'PENDING',
    `type` ENUM('FULL_PAYMENT', 'DEPOSITED', 'CREDIT_USED', 'DEPOSITED_CREDIT_USED') NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Order_customerId_userId_branchId_orderCode_key`(`customerId`, `userId`, `branchId`, `orderCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentMethod_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOrder` (
    `orderId` VARCHAR(191) NOT NULL,
    `amountRecevied` DOUBLE NULL,
    `change` DOUBLE NULL,
    `deposit` DOUBLE NULL,
    `credit` INTEGER NULL,
    `discount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,
    `paymentMethodId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PaymentOrder_orderId_key`(`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOrderSlip` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `paymentOrderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentOrderSlip_imageUrl_key`(`imageUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `orderId` VARCHAR(191) NOT NULL,
    `trackNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `fee` DOUBLE NOT NULL DEFAULT 0,
    `distance` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELED', 'DELAYED') NOT NULL DEFAULT 'PENDING',
    `type` ENUM('STANDARD', 'EXPRESS') NOT NULL,
    `lng` DOUBLE NOT NULL,
    `lat` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `sendDate` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    UNIQUE INDEX `Delivery_trackNumber_key`(`trackNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryDriver` (
    `deliveryId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`deliveryId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_customerGroupId_fkey` FOREIGN KEY (`customerGroupId`) REFERENCES `CustomerGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInHistory` ADD CONSTRAINT `StockInHistory_canceledBy_fkey` FOREIGN KEY (`canceledBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInHistory` ADD CONSTRAINT `StockInHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInHistory` ADD CONSTRAINT `StockInHistory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInItem` ADD CONSTRAINT `StockInItem_stockInHistoryId_fkey` FOREIGN KEY (`stockInHistoryId`) REFERENCES `StockInHistory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInItem` ADD CONSTRAINT `StockInItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockInItem` ADD CONSTRAINT `StockInItem_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOutHistory` ADD CONSTRAINT `StockOutHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOutHistory` ADD CONSTRAINT `StockOutHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOutHistory` ADD CONSTRAINT `StockOutHistory_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSaleBranch` ADD CONSTRAINT `ProductSaleBranch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSaleBranch` ADD CONSTRAINT `ProductSaleBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentOrder` ADD CONSTRAINT `PaymentOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentOrder` ADD CONSTRAINT `PaymentOrder_paymentMethodId_fkey` FOREIGN KEY (`paymentMethodId`) REFERENCES `PaymentMethod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentOrderSlip` ADD CONSTRAINT `PaymentOrderSlip_paymentOrderId_fkey` FOREIGN KEY (`paymentOrderId`) REFERENCES `PaymentOrder`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`orderId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryDriver` ADD CONSTRAINT `DeliveryDriver_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
