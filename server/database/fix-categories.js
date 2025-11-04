import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'srv1943.hstgr.io',
  user: process.env.DB_USER || 'u407655108_ecommerce01',
  password: process.env.DB_PASSWORD || 'Monstermash@123',
  database: process.env.DB_NAME || 'u407655108_ecommerce01',
};

async function fixCategories() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    // Create categories table
    console.log('\nCreating categories table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Categories table created');

    // Add featured column if not exists
    console.log('\nAdding featured column to products...');
    try {
      await connection.execute(`
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false AFTER inStock
      `);
      console.log('✓ Featured column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Featured column already exists');
      } else {
        throw err;
      }
    }

    // Add categoryId column if not exists
    console.log('\nAdding categoryId column to products...');
    try {
      await connection.execute(`
        ALTER TABLE products ADD COLUMN categoryId INT AFTER category
      `);
      console.log('✓ categoryId column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ categoryId column already exists');
      } else {
        throw err;
      }
    }

    // Insert categories
    console.log('\nInserting categories...');
    await connection.execute(`
      INSERT IGNORE INTO categories (name, slug, description) VALUES
      ('Audio', 'audio', 'Audio equipment and accessories'),
      ('Wearables', 'wearables', 'Wearable technology and smart devices'),
      ('Accessories', 'accessories', 'Tech accessories and peripherals'),
      ('Cameras', 'cameras', 'Camera equipment and accessories'),
      ('Displays', 'displays', 'Monitors and display screens')
    `);
    console.log('✓ Categories inserted');

    // Update products with category IDs
    console.log('\nUpdating products with category IDs...');
    const [categories] = await connection.execute('SELECT id, slug FROM categories');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    const categoryMappings = [
      { slug: 'audio', name: 'Audio' },
      { slug: 'wearables', name: 'Wearables' },
      { slug: 'accessories', name: 'Accessories' },
      { slug: 'cameras', name: 'Cameras' },
      { slug: 'displays', name: 'Displays' }
    ];

    for (const mapping of categoryMappings) {
      if (categoryMap[mapping.slug]) {
        await connection.execute(
          'UPDATE products SET categoryId = ? WHERE category = ? AND (categoryId IS NULL OR categoryId = 0)',
          [categoryMap[mapping.slug], mapping.name]
        );
      }
    }
    console.log('✓ Products updated with category IDs');

    // Set featured products
    console.log('\nSetting featured products...');
    await connection.execute(`
      UPDATE products SET featured = true WHERE id IN (1, 2, 3, 8) AND featured = false
    `);
    console.log('✓ Featured products set');

    console.log('\n✓ All fixes completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

fixCategories();

