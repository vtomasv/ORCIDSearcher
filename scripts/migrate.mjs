import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

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
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
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
