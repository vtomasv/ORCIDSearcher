/**
 * Migration script to add debug fields to orcid_searches table
 * Run this script once to update your existing database
 * 
 * Usage: node migrate-debug-fields.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrate() {
  console.log('[Migration] Starting migration to add debug fields...');
  
  if (!process.env.DATABASE_URL) {
    console.error('[Migration] ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }

  // Create connection
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orcid_searches' 
        AND COLUMN_NAME IN ('debugHtml', 'debugInfo', 'errorMessage', 'searchedAt')
    `);
    
    const existingColumns = columns.map(row => row.COLUMN_NAME);
    console.log('[Migration] Existing debug columns:', existingColumns);
    
    // Add errorMessage column if it doesn't exist
    if (!existingColumns.includes('errorMessage')) {
      console.log('[Migration] Adding errorMessage column...');
      await connection.query(`
        ALTER TABLE orcid_searches 
        ADD COLUMN errorMessage TEXT NULL AFTER notes
      `);
      console.log('[Migration] ✓ errorMessage column added');
    } else {
      console.log('[Migration] ✓ errorMessage column already exists');
    }
    
    // Add searchedAt column if it doesn't exist
    if (!existingColumns.includes('searchedAt')) {
      console.log('[Migration] Adding searchedAt column...');
      await connection.query(`
        ALTER TABLE orcid_searches 
        ADD COLUMN searchedAt TIMESTAMP NULL AFTER errorMessage
      `);
      console.log('[Migration] ✓ searchedAt column added');
    } else {
      console.log('[Migration] ✓ searchedAt column already exists');
    }
    
    // Add debugHtml column if it doesn't exist
    if (!existingColumns.includes('debugHtml')) {
      console.log('[Migration] Adding debugHtml column...');
      await connection.query(`
        ALTER TABLE orcid_searches 
        ADD COLUMN debugHtml TEXT NULL AFTER searchedAt
      `);
      console.log('[Migration] ✓ debugHtml column added');
    } else {
      console.log('[Migration] ✓ debugHtml column already exists');
    }
    
    // Add debugInfo column if it doesn't exist
    if (!existingColumns.includes('debugInfo')) {
      console.log('[Migration] Adding debugInfo column...');
      await connection.query(`
        ALTER TABLE orcid_searches 
        ADD COLUMN debugInfo TEXT NULL AFTER debugHtml
      `);
      console.log('[Migration] ✓ debugInfo column added');
    } else {
      console.log('[Migration] ✓ debugInfo column already exists');
    }
    
    console.log('[Migration] ✅ Migration completed successfully!');
    console.log('[Migration] You can now use the debug logging features.');
    
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
