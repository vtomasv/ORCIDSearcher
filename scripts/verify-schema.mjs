import mysql from 'mysql2/promise';

/**
 * Verify database schema matches expected structure
 */
async function verifySchema() {
  console.log('[Schema Verification] Starting...');
  
  if (!process.env.DATABASE_URL) {
    console.error('[Schema Verification] DATABASE_URL is not set');
    process.exit(1);
  }

  let connection;
  
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('[Schema Verification] Database connection established');
    
    // Check orcid_searches table structure
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcid_searches' ORDER BY ORDINAL_POSITION"
    );
    
    console.log('[Schema Verification] orcid_searches table structure:');
    console.table(columns);
    
    // Check for required debugging fields
    const requiredFields = ['errorMessage', 'searchedAt', 'debugHtml', 'debugInfo'];
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    const missingFields = requiredFields.filter(field => !columnNames.includes(field));
    
    if (missingFields.length > 0) {
      console.error('[Schema Verification] ❌ Missing fields:', missingFields);
      console.error('[Schema Verification] Run migrations to add missing fields');
      process.exit(1);
    } else {
      console.log('[Schema Verification] ✅ All required fields present');
    }
    
    console.log('[Schema Verification] ✅ Schema verification passed');
  } catch (error) {
    console.error('[Schema Verification] Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifySchema();
