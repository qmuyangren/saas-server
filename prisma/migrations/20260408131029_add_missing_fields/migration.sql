-- AlterTable
ALTER TABLE `base_department` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL;

-- AlterTable
ALTER TABLE `base_permission` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL;

-- AlterTable
ALTER TABLE `base_permission_group` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL;

-- AlterTable
ALTER TABLE `base_position` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL;

-- AlterTable
ALTER TABLE `base_role` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL;

-- AlterTable
ALTER TABLE `cfg_system_config` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL,
    ADD COLUMN `is_deleted` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `cfg_third_party` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `config` TEXT NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `is_default` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cfg_third_party_code_key`(`code`),
    INDEX `cfg_third_party_type_idx`(`type`),
    INDEX `cfg_third_party_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
