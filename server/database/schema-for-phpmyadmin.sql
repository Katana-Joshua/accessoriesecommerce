-- Copy and paste this entire file into phpMyAdmin SQL tab
-- This is a clean version optimized for manual execution

-- Create products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `rating` DECIMAL(3, 1) DEFAULT 0.0,
  `reviews` INT DEFAULT 0,
  `inStock` BOOLEAN DEFAULT true,
  `description` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create order_items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample products
INSERT INTO `products` (`name`, `price`, `image`, `category`, `rating`, `reviews`, `inStock`) VALUES
('Wireless Noise-Cancelling Headphones', 299.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', 'Audio', 4.8, 1243, true),
('Smart Watch Pro', 449.99, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', 'Wearables', 4.6, 892, true),
('Mechanical Gaming Keyboard', 159.99, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800', 'Accessories', 4.9, 2156, true),
('4K Ultra HD Webcam', 129.99, 'https://images.pexels.com/photos/5588603/pexels-photo-5588603.jpeg?auto=compress&cs=tinysrgb&w=800', 'Cameras', 4.5, 634, true),
('Portable Bluetooth Speaker', 89.99, 'https://images.pexels.com/photos/1279684/pexels-photo-1279684.jpeg?auto=compress&cs=tinysrgb&w=800', 'Audio', 4.7, 1567, true),
('USB-C Charging Hub', 79.99, 'https://images.pexels.com/photos/4219861/pexels-photo-4219861.jpeg?auto=compress&cs=tinysrgb&w=800', 'Accessories', 4.4, 421, false),
('Wireless Gaming Mouse', 119.99, 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800', 'Accessories', 4.8, 978, true),
('LED Monitor 27" 4K', 549.99, 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800', 'Displays', 4.9, 1834, true);

