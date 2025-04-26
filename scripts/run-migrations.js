import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to migration files
const migrationsPath = path.join(__dirname, '../supabase/migrations');

// Ensure the migrations directory exists
if (!fs.existsSync(migrationsPath)) {
  console.error('Migrations directory does not exist:', migrationsPath);
  process.exit(1);
}

// Read all migration files
const migrationFiles = fs.readdirSync(migrationsPath)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure migrations run in order

console.log('Found migration files:', migrationFiles);

// Get Supabase URL and service key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Required environment variables are missing.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

// Run each migration
for (const file of migrationFiles) {
  const filePath = path.join(migrationsPath, file);
  console.log(`Running migration: ${file}`);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Create a temporary file with just this migration
    const tempFile = path.join(__dirname, '_temp_migration.sql');
    fs.writeFileSync(tempFile, sql);
    
    // Run the migration using the Supabase CLI or psql directly
    // Alternative command for direct connection to Supabase with psql
    const command = `npx psql "${supabaseUrl}" -f "${tempFile}" -U postgres`;
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        PGPASSWORD: supabaseKey
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    console.log(`Migration successful: ${file}`);
  } catch (error) {
    console.error(`Error running migration ${file}:`, error.message);
    process.exit(1);
  }
}

console.log('All migrations completed successfully!'); 