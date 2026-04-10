-- CreateTable
CREATE TABLE `base_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(32) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(50) NULL,
    `avatar` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `user_type` INTEGER NOT NULL DEFAULT 2,
    `company_id` BIGINT NULL,
    `department_id` BIGINT NULL,
    `position_id` BIGINT NULL,
    `wechat_openid` VARCHAR(100) NULL,
    `dingtalk_userid` VARCHAR(100) NULL,
    `wework_userid` VARCHAR(100) NULL,
    `github_id` VARCHAR(100) NULL,
    `last_login_ip` VARCHAR(50) NULL,
    `last_login_time` DATETIME(3) NULL,
    `login_count` INTEGER NOT NULL DEFAULT 0,
    `register_time` DATETIME(3) NULL,
    `register_ip` VARCHAR(50) NULL,
    `token_version` INTEGER NOT NULL DEFAULT 1,
    `password_expire_time` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `base_user_uuid_key`(`uuid`),
    UNIQUE INDEX `base_user_username_key`(`username`),
    INDEX `base_user_company_id_idx`(`company_id`),
    INDEX `base_user_department_id_idx`(`department_id`),
    INDEX `base_user_status_idx`(`status`),
    INDEX `base_user_is_deleted_idx`(`is_deleted`),
    INDEX `base_user_created_at_idx`(`created_at`),
    INDEX `base_user_position_id_fkey`(`position_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_company` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `level` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,
    `deleted_by` BIGINT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `base_company_code_key`(`code`),
    INDEX `base_company_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_department` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `leader_id` BIGINT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    INDEX `base_department_company_id_idx`(`company_id`),
    INDEX `base_department_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_position` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `base_position_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `base_role_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `type` INTEGER NOT NULL,
    `path` VARCHAR(255) NULL,
    `component` VARCHAR(255) NULL,
    `icon` VARCHAR(50) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `base_permission_code_key`(`code`),
    INDEX `base_permission_parent_id_idx`(`parent_id`),
    INDEX `base_permission_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_permission_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `base_permission_group_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `base_user_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `color` VARCHAR(20) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `map_user_role_user_id_idx`(`user_id`),
    INDEX `map_user_role_role_id_idx`(`role_id`),
    UNIQUE INDEX `map_user_role_user_id_role_id_key`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_user_group` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `group_id` BIGINT NOT NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `map_user_group_user_id_idx`(`user_id`),
    INDEX `map_user_group_group_id_idx`(`group_id`),
    UNIQUE INDEX `map_user_group_user_id_group_id_key`(`user_id`, `group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_user_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `map_user_tag_tag_id_fkey`(`tag_id`),
    UNIQUE INDEX `map_user_tag_user_id_tag_id_key`(`user_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_permission_group_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `permission_group_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `map_permission_group_permission_permission_id_fkey`(`permission_id`),
    UNIQUE INDEX `map_permission_group_permission_permission_group_id_permissi_key`(`permission_group_id`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `map_permission_group_target` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `permission_group_id` BIGINT NOT NULL,
    `target_type` VARCHAR(20) NOT NULL,
    `target_id` BIGINT NOT NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `map_permission_group_target_target_type_target_id_idx`(`target_type`, `target_id`),
    INDEX `map_permission_group_target_permission_group_id_idx`(`permission_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cfg_dict_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `cfg_dict_type_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cfg_dict_data` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_type` VARCHAR(50) NOT NULL,
    `label` VARCHAR(50) NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `css_class` VARCHAR(50) NULL,
    `is_default` INTEGER NOT NULL DEFAULT 0,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cfg_dict_data_dict_type_idx`(`dict_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cfg_system_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `config_key` VARCHAR(100) NOT NULL,
    `config_value` TEXT NULL,
    `config_type` VARCHAR(20) NULL DEFAULT 'text',
    `config_group` VARCHAR(50) NULL DEFAULT 'basic',
    `name` VARCHAR(50) NOT NULL,
    `remark` VARCHAR(255) NULL,
    `is_public` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` BIGINT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cfg_system_config_config_key_key`(`config_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_oper` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `username` VARCHAR(50) NULL,
    `module` VARCHAR(50) NULL,
    `operation` VARCHAR(50) NULL,
    `method` VARCHAR(10) NULL,
    `url` VARCHAR(255) NULL,
    `params` TEXT NULL,
    `result` TEXT NULL,
    `status` INTEGER NULL,
    `error_msg` TEXT NULL,
    `ip` VARCHAR(50) NULL,
    `duration` INTEGER NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `log_oper_user_id_idx`(`user_id`),
    INDEX `log_oper_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `base_user` ADD CONSTRAINT `base_user_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `base_company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `base_user` ADD CONSTRAINT `base_user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `base_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `base_user` ADD CONSTRAINT `base_user_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `base_position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `base_department` ADD CONSTRAINT `base_department_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `base_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_role` ADD CONSTRAINT `map_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `base_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_role` ADD CONSTRAINT `map_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_group` ADD CONSTRAINT `map_user_group_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `base_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_group` ADD CONSTRAINT `map_user_group_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_tag` ADD CONSTRAINT `map_user_tag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `base_user_tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_user_tag` ADD CONSTRAINT `map_user_tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_permission_group_permission` ADD CONSTRAINT `map_permission_group_permission_permission_group_id_fkey` FOREIGN KEY (`permission_group_id`) REFERENCES `base_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_permission_group_permission` ADD CONSTRAINT `map_permission_group_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `base_permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `map_permission_group_target` ADD CONSTRAINT `map_permission_group_target_permission_group_id_fkey` FOREIGN KEY (`permission_group_id`) REFERENCES `base_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cfg_dict_data` ADD CONSTRAINT `cfg_dict_data_dict_type_fkey` FOREIGN KEY (`dict_type`) REFERENCES `cfg_dict_type`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_oper` ADD CONSTRAINT `log_oper_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `base_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
