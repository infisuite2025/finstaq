-- Initial MySQL Database Setup for Finstaq
CREATE DATABASE IF NOT EXISTS finstaq_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON finstaq_production.* TO 'finstaq_user'@'%';
FLUSH PRIVILEGES;
