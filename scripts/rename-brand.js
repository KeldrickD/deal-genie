// scripts/rename-brand.js
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

async function replaceInFile(file, replacements) {
  try {
    let content = await fs.readFile(file, 'utf8');
    let original = content;
    for (const { from, to } of replacements) {
      // Use a regex for case-insensitive replacement of the brand name
      if (from.toLowerCase() === 'genieos') {
        const regex = new RegExp(from, 'gi'); // Global, case-insensitive
        content = content.replace(regex, to);
      } else {
        // For domain or other specific strings, use split/join for exact match
        content = content.split(from).join(to);
      }
    }
    if (content !== original) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`✔ Updated: ${file}`);
    }
  } catch (err) {
    // Ignore errors for binary files or files that cannot be read/written
    if (err.code !== 'ENOENT' && err.code !== 'EISDIR') {
       console.warn(`Could not process file ${file}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Starting brand renaming process...');
  const replacements = [
    // Brand rename (handle case variations via regex in replaceInFile)
    { from: 'GenieOS', to: 'Deal Genie' }, 
    
    // Domain rename (exact match)
    { from: 'your-domain.com', to: 'dealgenieos.com' },
    { from: 'your-domain', to: 'dealgenieos' }, // Handle partial domain mentions
  ];

  // 1. Find all relevant files
  const paths = await globby([
    '**/*.{js,ts,jsx,tsx,json,md,html,css,mjs}', // Added mjs
    '!node_modules/**', // Exclude node_modules more robustly
    '!\.next/**', // Exclude build output
    '!public/**', // Avoid replacing in public assets unless intended
    '!scripts/rename-brand.js' // Exclude self
  ], { gitignore: true }); // Respect .gitignore

  console.log(`Found ${paths.length} files to potentially update...`);

  // 2. Apply replacements
  await Promise.all(paths.map(file => replaceInFile(file, replacements)));

  // 3. Update package.json separately
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    pkg.name = 'deal-genie'; // Updated name
    pkg.description = 'Deal Genie: AI Operating System for Real Estate Deals'; // Updated description
    pkg.version = '1.0.0'; // Set version to 1.0.0 as requested
    // You might want to update author, repository.url etc. here too
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8'); // Add trailing newline
    console.log('✔ Updated: package.json');
  } catch (err) {
      console.error(`Failed to update package.json: ${err.message}`);
  }
  
  console.log('Brand renaming process complete.');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
}); 