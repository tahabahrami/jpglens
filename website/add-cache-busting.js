// Add cache-busting version numbers to asset URLs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const version = Date.now();

function addCacheBusting(filePath) {
  console.log(`📝 Processing ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf-8');
  
  // Replace CSS links
  content = content.replace(
    /href="\/src\/styles\/([^"]+\.css)"/g,
    `href="/src/styles/$1?v=${version}"`
  );
  
  // Replace JS script sources
  content = content.replace(
    /src="\/src\/scripts\/([^"]+\.js)"/g,
    `src="/src/scripts/$1?v=${version}"`
  );
  
  writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath} with version ${version}`);
}

try {
  console.log('🚀 Adding cache-busting version numbers...\n');
  
  // Process all HTML files
  const htmlFiles = [
    'dist/index.html',
    'dist/docs/index.html',
    'dist/examples/index.html',
    'dist/comparison/index.html'
  ];
  
  for (const file of htmlFiles) {
    try {
      addCacheBusting(file);
    } catch (error) {
      console.log(`⚠️ Could not process ${file}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Cache-busting version ${version} added to all files!`);
  
} catch (error) {
  console.error('❌ Error adding cache-busting:', error.message);
  process.exit(1);
}
