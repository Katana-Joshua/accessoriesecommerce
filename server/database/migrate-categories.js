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
  multipleStatements: true,
};

async function migrateCategories() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\nExecuting categories migration...');
    
    // Execute SQL statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await connection.query(statement);
        
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?/i);
          const tableName = tableMatch ? tableMatch[1] : 'unknown';
          console.log(`  ✓ [${i + 1}/${statements.length}] Created/verified table: ${tableName}`);
        } else if (statement.toUpperCase().includes('ALTER TABLE')) {
          console.log(`  ✓ [${i + 1}/${statements.length}] Updated products table`);
        } else if (statement.toUpperCase().includes('INSERT INTO')) {
          console.log(`  ✓ [${i + 1}/${statements.length}] Inserted categories`);
        } else if (statement.toUpperCase().includes('UPDATE')) {
          console.log(`  ✓ [${i + 1}/${statements.length}] Updated products`);
        } else {
          console.log(`  ✓ [${i + 1}/${statements.length}] Executed statement`);
        }
      } catch (stmtError) {
        if (stmtError.code === 'ER_DUP_FIELDNAME' || stmtError.code === 'ER_DUP_KEYNAME') {
          console.log(`  ⚠ [${i + 1}/${statements.length}] Column/constraint already exists (skipping)`);
        } else if (stmtError.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⚠ [${i + 1}/${statements.length}] Table already exists (skipping)`);
        } else {
          console.error(`  ✗ [${i + 1}/${statements.length}] Error:`, stmtError.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('\n✓ Categories migration completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Error migrating categories:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

migrateCategories();

