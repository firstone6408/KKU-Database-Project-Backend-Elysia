CREATE TABLE
    IF NOT EXISTS `users` (
        `id` BIGINT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(255) NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) NOT NULL,
        `image` VARCHAR(100),
        `password` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(20),
        `last_login` DATETIME (3),
        `created_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME (3) DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `role` ENUM ('ADMIN', 'MANAGER', 'USER') NOT NULL DEFAULT 'USER',
        `status` ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        CONSTRAINT `user_pk` PRIMARY KEY (`id`),
        CONSTRAINT `username_unique` UNIQUE (`username`)
    );