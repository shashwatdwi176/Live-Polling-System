import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.DATABASE_URL) {
    console.log('DEBUG: Connection string format check:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
}

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ CRITICAL: DATABASE_URL is not defined.');
    console.error('Please configure DATABASE_URL in your .env file or environment variables.');
    process.exit(1);
}

const sslConfig = { rejectUnauthorized: false };

const pool = new Pool({
    connectionString,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result.rows;
    } catch (error) {
        console.error('Query error:', { text, error });
        throw error;
    }
}

export async function transaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export { pool };
