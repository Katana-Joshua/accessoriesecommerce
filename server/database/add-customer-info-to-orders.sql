-- Add customer information columns to orders table
ALTER TABLE `orders` 
ADD COLUMN `customerName` VARCHAR(255) AFTER `status`,
ADD COLUMN `customerEmail` VARCHAR(255) AFTER `customerName`,
ADD COLUMN `customerContact` VARCHAR(50) AFTER `customerEmail`;

