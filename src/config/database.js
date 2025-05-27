import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// connection to the default postgres database
const defaultPool = new Pool({
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT),
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: 'postgres',
});

// Pool for our application database
const pool = new Pool({
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT),
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: 'csv_converter',
});

const initializeDatabase = async () => {
   try {
      // Checking if database doesn't exists then creating
      const result = await defaultPool.query(
         "SELECT datname FROM pg_catalog.pg_database WHERE datname = 'csv_converter'"
      );

      if (result.rowCount === 0) {
         await defaultPool.query('CREATE DATABASE csv_converter');
         console.log('Database "csv_converter" created successfully');
      }

      await defaultPool.end();

      // Creating users table in database
      await pool.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                age INTEGER NOT NULL,
                address JSONB,
                additional_info JSONB
            );
        `);
      console.log('Database initialized successfully');
   } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
   }
};

export { pool, initializeDatabase };
