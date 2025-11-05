import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
};

async function addCustomerInfoToOrders() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');

    console.log('\nAdding customer info columns to orders table...');

    // Check if columns exist and add them one by one
    const columns = [
      { name: 'customerName', type: 'VARCHAR(255)', after: 'status' },
      { name: 'customerEmail', type: 'VARCHAR(255)', after: 'customerName' },
      { name: 'customerContact', type: 'VARCHAR(50)', after: 'customerEmail' }
    ];

    for (const column of columns) {
      try {
        // Check if column exists
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
          [dbConfig.database, column.name]
        );

        if (columns.length === 0) {
          // Column doesn't exist, add it
          const afterClause = column.after ? `AFTER \`${column.after}\`` : '';
          await connection.query(
            `ALTER TABLE \`orders\` ADD COLUMN \`${column.name}\` ${column.type} ${afterClause}`
          );
          console.log(`  ✓ Added column: ${column.name}`);
        } else {
          console.log(`  ⚠ Column ${column.name} already exists (skipping)`);
        }
      } catch (stmtError) {
        if (stmtError.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ⚠ Column ${column.name} already exists (skipping)`);
        } else {
          console.error(`  ✗ Error adding column ${column.name}:`, stmtError.message);
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

