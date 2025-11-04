CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image` VARCHAR(500),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `categories` (`name`, `slug`, `description`) VALUES
('Audio', 'audio', 'Audio equipment and accessories'),
('Wearables', 'wearables', 'Wearable technology and smart devices'),
('Accessories', 'accessories', 'Tech accessories and peripherals'),
('Cameras', 'cameras', 'Camera equipment and accessories'),
('Displays', 'displays', 'Monitors and display screens');

