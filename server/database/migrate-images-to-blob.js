import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  connectTimeout: 10000,
};

async function migrateImagesToBlob() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    console.log('\nMigrating image columns to LONGBLOB...');

    // Update products table
    try {
      await connection.query('ALTER TABLE `products` MODIFY COLUMN `image` LONGBLOB');
      console.log('  ✓ Updated products.image to LONGBLOB');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('  ⚠ products.image column does not exist');
      } else {
        throw error;
      }
    }

    // Update categories table
    try {
      await connection.query('ALTER TABLE `categories` MODIFY COLUMN `image` LONGBLOB');
      console.log('  ✓ Updated categories.image to LONGBLOB');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('  ⚠ categories.image column does not exist');
      } else {
        throw error;
      }
    }

    console.log('\n✓ Image migration completed successfully!');
    console.log('\n⚠ Note: Existing URL-based images will need to be re-uploaded as files.');

  } catch (error) {
    console.error('\n✗ Error migrating images:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

migrateImagesToBlob();

