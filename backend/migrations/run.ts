#!/usr/bin/env ts-node

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase transaction pooler
});

async function runMigrations() {
    try {
        console.log('Running database migrations...');

        const migrationFile = path.join(__dirname, '001_initial_schema.sql');
        const sql = fs.readFileSync(migrationFile, 'utf-8');

        await pool.query(sql);

        console.log('Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(' Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
