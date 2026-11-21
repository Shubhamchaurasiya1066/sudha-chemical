import mysql from 'mysql2/promise';

// Next.js development me hot-reload hone par baar-baar naye pool banne se bachane ke liye global variable use kar rahe hain
let pool = global.mysqlPool;

if (!pool) {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    database: process.env.MYSQL_DATABASE || 'sudha_chemicals',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Ek time par max 10 connections
    queueLimit: 0,
    dateStrings: true, // Date ko string me return karega
  });
  
  if (process.env.NODE_ENV !== 'production') {
    global.mysqlPool = pool;
  }
}

// Aapke saare API routes isi 'query' function ko use kar rahe hain, isliye iska format same rakha hai
export async function query({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}