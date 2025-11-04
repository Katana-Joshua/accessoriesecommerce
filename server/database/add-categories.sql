-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image` VARCHAR(500),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default categories first
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`) VALUES
('Audio', 'audio', 'Audio equipment and accessories'),
('Wearables', 'wearables', 'Wearable technology and smart devices'),
('Accessories', 'accessories', 'Tech accessories and peripherals'),
('Cameras', 'cameras', 'Camera equipment and accessories'),
('Displays', 'displays', 'Monitors and display screens');

-- Add featured column to products table (if not exists)
SET @exist_featured := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'featured');
SET @sql_featured := IF(@exist_featured = 0, 
  'ALTER TABLE `products` ADD COLUMN `featured` BOOLEAN DEFAULT false AFTER `inStock`', 
  'SELECT "Column featured already exists"');
PREPARE stmt FROM @sql_featured;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add categoryId column to products table (if not exists)
SET @exist_categoryId := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'categoryId');
SET @sql_categoryId := IF(@exist_categoryId = 0, 
  'ALTER TABLE `products` ADD COLUMN `categoryId` INT AFTER `category`', 
  'SELECT "Column categoryId already exists"');
PREPARE stmt FROM @sql_categoryId;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing products to use category IDs
UPDATE `products` SET `categoryId` = (SELECT id FROM categories WHERE slug = 'audio' LIMIT 1) WHERE category = 'Audio' AND categoryId IS NULL;
UPDATE `products` SET `categoryId` = (SELECT id FROM categories WHERE slug = 'wearables' LIMIT 1) WHERE category = 'Wearables' AND categoryId IS NULL;
UPDATE `products` SET `categoryId` = (SELECT id FROM categories WHERE slug = 'accessories' LIMIT 1) WHERE category = 'Accessories' AND categoryId IS NULL;
UPDATE `products` SET `categoryId` = (SELECT id FROM categories WHERE slug = 'cameras' LIMIT 1) WHERE category = 'Cameras' AND categoryId IS NULL;
UPDATE `products` SET `categoryId` = (SELECT id FROM categories WHERE slug = 'displays' LIMIT 1) WHERE category = 'Displays' AND categoryId IS NULL;

-- Add foreign key constraint (if not exists)
SET @exist_fk := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND CONSTRAINT_NAME = 'products_ibfk_1');
SET @sql_fk := IF(@exist_fk = 0, 
  'ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL', 
  'SELECT "Foreign key already exists"');
PREPARE stmt FROM @sql_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Set some products as featured
UPDATE `products` SET `featured` = true WHERE id IN (1, 2, 3, 8) AND featured = false;

