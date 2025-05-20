import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the migration file path from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Error: No migration file specified. Usage: node run-migrate.js <migration-file>');
  process.exit(1);
}

// Path to migrations directory
const migrationsDir = path.join(__dirname, 'src', 'db', 'migrations');

// Check if the specified file exists
const filePath = path.join(migrationsDir, migrationFile);
if (!fs.existsSync(filePath)) {
  console.error(`Error: Migration file ${filePath} does not exist.`);
  process.exit(1);
}

// Read the SQL migration file
const sql = fs.readFileSync(filePath, 'utf8');

// Execute the migration using Supabase
async function runMigration() {
  console.log(`Running migration: ${migrationFile}`);
  try {
    // Execute the SQL directly using Postgres extension
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing migration:', error);
      process.exit(1);
    }
    
    console.log(`Migration ${migrationFile} executed successfully.`);
  } catch (err) {
    console.error('Error executing migration:', err);
    console.error('Note: This script requires a custom SQL function "exec_sql" to be defined in your Supabase project.');
    console.error('Alternatively, use the Supabase CLI to run migrations directly.');
    process.exit(1);
  }
}

runMigration(); 