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

async function addCustomerInfoToOrders() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    const sqlPath = path.join(__dirname, 'add-customer-info-to-orders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\nAdding customer info columns to orders table...');

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('  ✓ Added customer info columns to orders table');
      } catch (stmtError) {
        if (stmtError.code === 'ER_DUP_FIELDNAME') {
          console.log('  ⚠ Customer info columns already exist (skipping)');
        } else {
          console.error(`  ✗ Error executing statement: ${stmtError.message}`);
          throw stmtError;
        }
      }
    }

    console.log('\n✓ Customer info migration completed successfully!');

  } catch (error) {
    console.error('\n✗ Error during customer info migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

addCustomerInfoToOrders();

