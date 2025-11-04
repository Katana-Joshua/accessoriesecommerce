import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv1943.hstgr.io',
  user: process.env.DB_USER || 'u407655108_ecommerce01',
  password: process.env.DB_PASSWORD || 'Monstermash@123',
  database: process.env.DB_NAME || 'u407655108_ecommerce01',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = pool.promise();

