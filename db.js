import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definido no .env')
}

export const db = await mysql.createConnection(process.env.DATABASE_URL)
