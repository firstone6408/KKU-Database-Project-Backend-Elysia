CREATE TABLE
    IF NOT EXISTS `_migrations` (
        `id` BIGINT AUTO_INCREMENT NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT `migrate_pk` PRIMARY KEY (`id`)
    )