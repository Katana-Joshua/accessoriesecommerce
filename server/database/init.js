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
  ssl: false,
  connectTimeout: 10000,
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    console.log('Host:', dbConfig.host);
    console.log('User:', dbConfig.user);
    console.log('Database:', dbConfig.database);
    
    // First, try to connect without specifying database to test credentials
    const testConfig = { ...dbConfig };
    delete testConfig.database;
    
    try {
      console.log('\nTesting connection without database...');
      const testConnection = await mysql.createConnection(testConfig);
      console.log('✓ Basic connection successful!');
      await testConnection.end();
    } catch (testError) {
      console.error('✗ Basic connection failed:', testError.message);
      console.error('\nPossible issues:');
      console.error('1. Wrong password or username');
      console.error('2. IP address not whitelisted in database');
      console.error('3. Database server is down');
      console.error('4. SSL connection required');
      throw testError;
    }
    
    // Now connect with database
    console.log('\nConnecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database successfully!');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\nExecuting schema...');
    
    // Remove single-line comments
    let cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolon, but be careful with multi-line statements
    // We need to split on semicolons that are at the end of statements (not inside strings)
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < cleanSql.length; i++) {
      const char = cleanSql[i];
      const nextChar = cleanSql[i + 1];
      
      // Track string boundaries
      if ((char === '"' || char === "'" || char === '`') && (i === 0 || cleanSql[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      currentStatement += char;
      
      // If we hit a semicolon and we're not in a string, end the current statement
      if (char === ';' && !inString) {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Execute each statement
        await connection.query(statement);
        
        // Log what was executed
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i);
          const tableName = tableMatch ? tableMatch[1] : 'unknown';
          console.log(`  ✓ [${i + 1}/${statements.length}] Created table: ${tableName}`);
        } else if (statement.toUpperCase().includes('INSERT INTO')) {
          const rowsMatch = statement.match(/VALUES\s*\(/g);
          const rowCount = rowsMatch ? rowsMatch.length : 1;
          console.log(`  ✓ [${i + 1}/${statements.length}] Inserted ${rowCount} row(s) into products`);
        } else {
          console.log(`  ✓ [${i + 1}/${statements.length}] Executed statement`);
        }
      } catch (stmtError) {
        // Some errors are expected (like table already exists)
        if (stmtError.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⚠ [${i + 1}/${statements.length}] Table already exists (skipping)`);
        } else if (stmtError.code === 'ER_DUP_ENTRY') {
          console.log(`  ⚠ [${i + 1}/${statements.length}] Data already inserted (skipping)`);
        } else {
          console.error(`  ✗ [${i + 1}/${statements.length}] Error:`, stmtError.message);
          console.error(`  Statement preview: ${statement.substring(0, 100)}...`);
          throw stmtError;
        }
      }
    }
    
    console.log('\n✓ Database initialized successfully!');
    
  } catch (error) {
    console.error('\n✗ Error initializing database:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify credentials are correct');
    console.error('2. Check if your IP is whitelisted in the database server');
    console.error('3. Try connecting manually with MySQL client');
    console.error('4. Check if database server allows remote connections');
    console.error('\nYou can also run the SQL manually from server/database/schema.sql');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

initDatabase();

