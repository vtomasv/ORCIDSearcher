import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations automatically
 * This script is executed before starting the server to ensure
 * all tables are created and up to date
 */
async function runMigrations() {
  console.log('[Migration] Starting database migrations...');
  
  if (!process.env.DATABASE_URL) {
    console.error('[Migration] DATABASE_URL is not set');
    process.exit(1);
  }

  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('[Migration] Database connection established');
    
    // Create drizzle instance
    const db = drizzle(connection);
    
    // Run Drizzle migrations (0000, 0001)
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[Migration] Drizzle migrations completed');
    
    // Manually run additional SQL migrations that aren't in the journal
    const migrationsDir = path.join(__dirname, '..', 'drizzle');
    const manualMigrations = [
      '0002_add_upload_session_id.sql',
      '0003_add_debug_fields.sql'
    ];
    
    for (const migrationFile of manualMigrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (fs.existsSync(migrationPath)) {
        console.log(`[Migration] Executing manual migration: ${migrationFile}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.query(statement);
              console.log(`[Migration] ✓ Executed statement from ${migrationFile}`);
            } catch (error) {
              // Ignore "Duplicate column" errors (migration already applied)
              if (error.code === 'ER_DUP_FIELDNAME') {
                console.log(`[Migration] ⊙ Column already exists, skipping`);
              }
              // Ignore "Duplicate key name" errors (index already exists)
              else if (error.code === 'ER_DUP_KEYNAME') {
                console.log(`[Migration] ⊙ Index already exists, skipping`);
              }
              // Ignore "Duplicate entry" errors (data already exists)
              else if (error.code === 'ER_DUP_ENTRY') {
                console.log(`[Migration] ⊙ Entry already exists, skipping`);
              } else {
                throw error;
              }
            }
          }
        }
      }
    }
    
    console.log('[Migration] Migrations completed successfully');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('[Migration] Database connection closed');
    }
  }
}

runMigrations();
