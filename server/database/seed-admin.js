import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'srv1943.hstgr.io',
  user: process.env.DB_USER || 'u407655108_ecommerce01',
  password: process.env.DB_PASSWORD || 'Monstermash@123',
  database: process.env.DB_NAME || 'u407655108_ecommerce01',
};

async function seedAdmin() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    // Check if users table exists, if not create it
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );

    if (tables.length === 0) {
      console.log('Creating users table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'admin',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✓ Users table created');
    }

    // Check if admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );

    if (existingUsers.length > 0) {
      console.log('⚠ Admin user already exists');
      return;
    }

    // Create default admin user
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await connection.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@ecommerce.com', hashedPassword, 'admin']
    );

    console.log('✓ Default admin user created');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  ⚠ Please change the password after first login!');
    
  } catch (error) {
    console.error('✗ Error seeding admin:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

seedAdmin();

