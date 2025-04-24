// Script to run migrations on Supabase

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the SQL file content
const sqlFile = path.join(__dirname, 'src', 'app', 'db-setup.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Replace single quotes with escaped single quotes for the command line
const escapedSql = sqlContent.replace(/'/g, "'\\''");

console.log('Running SQL migrations...');

try {
  // Execute the SQL using the supabase CLI
  const command = `npx supabase db execute --project-id vtgjketpinrqxzypgfyh --file-path "${sqlFile}"`;
  
  console.log(`Executing command: ${command}`);
  const output = execSync(command, { encoding: 'utf8' });
  
  console.log('Migration completed successfully:');
  console.log(output);
} catch (error) {
  console.error('Migration failed:');
  console.error(error.message);
  
  if (error.stdout) {
    console.error('Output:', error.stdout);
  }
  
  if (error.stderr) {
    console.error('Error output:', error.stderr);
  }
  
  process.exit(1);
} 