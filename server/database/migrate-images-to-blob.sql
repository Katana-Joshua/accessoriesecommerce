-- Migration script to convert image columns from VARCHAR to LONGBLOB
-- Run this script to update your database schema

-- Update products table
ALTER TABLE `products` 
MODIFY COLUMN `image` LONGBLOB;

-- Update categories table (if image column exists)
ALTER TABLE `categories` 
MODIFY COLUMN `image` LONGBLOB;

