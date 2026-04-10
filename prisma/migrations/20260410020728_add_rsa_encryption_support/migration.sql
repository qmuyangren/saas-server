-- CreateTable
CREATE TABLE `tenant` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `logo` VARCHAR(255) NULL,
    `contact_name` VARCHAR(50) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `contact_email` VARCHAR(100) NULL,
    `domain` VARCHAR(100) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `expire_at` DATETIME(3) NULL,
    `max_users` INTEGER NOT NULL DEFAULT 100,
    `used_users` INTEGER NOT NULL DEFAULT 0,
    `current_business_id` BIGINT NULL,
    `remark` VARCHAR(500) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `tenant_uuid_key`(`uuid`),
    UNIQUE INDEX `tenant_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_tenant` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `tenant_id` BIGINT NOT NULL,
    `is_default` INTEGER NOT NULL DEFAULT 0,
    `role_id` BIGINT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `user_tenant_user_id_idx`(`user_id`),
    INDEX `user_tenant_tenant_id_idx`(`tenant_id`),
    UNIQUE INDEX `user_tenant_user_id_tenant_id_key`(`user_id`, `tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `business_uuid_key`(`uuid`),
    UNIQUE INDEX `business_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_business` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `business_id` BIGINT NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `expires_at` DATETIME(3) NULL,
    `trial_at` DATETIME(3) NULL,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `tenant_business_tenant_id_idx`(`tenant_id`),
    INDEX `tenant_business_business_id_idx`(`business_id`),
    UNIQUE INDEX `tenant_business_tenant_id_business_id_key`(`tenant_id`, `business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(32) NOT NULL,
    `business_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `description` VARCHAR(500) NULL,
    `logo` VARCHAR(255) NULL,
    `domain` VARCHAR(100) NULL,
    `config` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `app_uuid_key`(`uuid`),
    INDEX `app_business_id_idx`(`business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_app` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `business_id` BIGINT NOT NULL,
    `app_id` BIGINT NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `business_app_business_id_idx`(`business_id`),
    INDEX `business_app_app_id_idx`(`app_id`),
    UNIQUE INDEX `business_app_business_id_app_id_key`(`business_id`, `app_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_client` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `app_id` BIGINT NOT NULL,
    `client_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `config` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `app_client_client_id_key`(`client_id`),
    INDEX `app_client_app_id_idx`(`app_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `super_admin` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `super_admin_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_tenant` ADD CONSTRAINT `user_tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_tenant` ADD CONSTRAINT `user_tenant_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_tenant` ADD CONSTRAINT `user_tenant_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `base_role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_business` ADD CONSTRAINT `tenant_business_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_business` ADD CONSTRAINT `tenant_business_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_app` ADD CONSTRAINT `business_app_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_app` ADD CONSTRAINT `business_app_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `app`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_client` ADD CONSTRAINT `app_client_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `app`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `super_admin` ADD CONSTRAINT `super_admin_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
