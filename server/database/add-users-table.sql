-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') DEFAULT 'admin',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
-- Password will be hashed by bcrypt: admin123
INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@ecommerce.com', '$2a$10$rOzJqZ5Z5Z5Z5Z5Z5Z5Z5e5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'admin');

