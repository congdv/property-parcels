import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'property_parcels',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  options: '-c search_path=public,topology'
})

export default pool