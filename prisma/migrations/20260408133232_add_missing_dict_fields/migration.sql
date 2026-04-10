-- AlterTable
ALTER TABLE `cfg_dict_data` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL,
    ADD COLUMN `description` VARCHAR(255) NULL,
    ADD COLUMN `is_deleted` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `cfg_dict_type` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `deleted_by` BIGINT NULL,
    ADD COLUMN `is_tree` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sort` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `type` INTEGER NOT NULL DEFAULT 1;
