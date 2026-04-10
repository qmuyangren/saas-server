-- CreateTable
CREATE TABLE `cfg_area` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `quick_query` VARCHAR(50) NULL,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `type` INT NOT NULL DEFAULT 1,
    `sort` INT NOT NULL DEFAULT 0,
    `status` INT NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_deleted` INT NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `cfg_area_parent_id_index`(`parent_id`),
    INDEX `cfg_area_type_index`(`type`),
    UNIQUE INDEX `cfg_area_code_key`(`code`),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
