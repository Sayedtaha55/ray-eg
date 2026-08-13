-- Reverse of 000019_add_builder_config_to_shops.up.sql

ALTER TABLE shops DROP COLUMN IF EXISTS builder_config;
