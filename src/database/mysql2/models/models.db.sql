-- branch
CREATE TABLE
    IF NOT EXISTS `branch` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(100) NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `branch_pk` PRIMARY KEY (`id`),
        CONSTRAINT `name_unique` UNIQUE (`name`)
    );

-- user
CREATE TABLE
    IF NOT EXISTS `user` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(100) NOT NULL,
        `full_name` VARCHAR(120) NOT NULL,
        `email` VARCHAR(100) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `image` VARCHAR(255) NOT NULL,
        `phone_number` VARCHAR(20) NOT NULL,
        `role` ENUM ('ADMIN', 'CASHIER', 'MANAGER', 'STAFF') NOT NULL,
        `status` ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        `last_login` DATETIME (3) NULL,
        `branch_id` INTEGER NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `user_pk` PRIMARY KEY (`id`),
        CONSTRAINT `username_unique` UNIQUE (`username`),
        CONSTRAINT `user_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- category
CREATE TABLE
    IF NOT EXISTS `category` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(100) NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `category_pk` PRIMARY KEY (`id`),
        CONSTRAINT `name_unique` UNIQUE (`name`)
    );

-- product
CREATE TABLE
    IF NOT EXISTS `product` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `sku` VARCHAR(100) NOT NULL,
        `name` VARCHAR(200) NOT NULL,
        `description` VARCHAR(255) NULL,
        `price` DOUBLE NOT NULL,
        `isDeleted` BOOLEAN NOT NULL DEFAULT false,
        `deleted_at` DATETIME (3) NULL,
        `category_id` INTEGER NULL,
        `branch_id` INTEGER NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `product_pk` PRIMARY KEY (`id`),
        CONSTRAINT `sku_unique` UNIQUE (`sku`),
        CONSTRAINT `product_fk_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `product_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- stock
CREATE TABLE
    IF NOT EXISTS `stock` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `quantity` INTEGER NOT NULL,
        `product_id` INTEGER NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `stock_pk` PRIMARY KEY (`id`),
        CONSTRAINT `stock_fk_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    );

-- stock_history
CREATE TABLE
    IF NOT EXISTS `stock_history` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `stock_id` INTEGER NOT NULL,
        `type` ENUM ('ADD', 'REMOVE', 'TRANSFER', 'ADJUST') NOT NULL,
        `user_id` INTEGER NOT NULL,
        `quantity` INTEGER NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        `note` VARCHAR(255) NULL,
        CONSTRAINT `stock_history_pk` PRIMARY KEY (`id`),
        CONSTRAINT `stock_history_fk_stock` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `stock_history_fk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- order
CREATE TABLE
    IF NOT EXISTS `order` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `order_date` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `total_price` DOUBLE NOT NULL,
        `user_id` INTEGER NOT NULL,
        `branch_id` INTEGER NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `order_pk` PRIMARY KEY (`id`),
        CONSTRAINT `order_fk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `order_fk_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- order_item
CREATE TABLE
    IF NOT EXISTS `order_item` (
        `id` INTEGER NOT NULL AUTO_INCREMENT,
        `quantity` INTEGER NOT NULL,
        `price` DOUBLE NOT NULL,
        `order_id` INTEGER NOT NULL,
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3),
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT `order_item_pk` PRIMARY KEY (`id`),
        CONSTRAINT `order_item_fk_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    );