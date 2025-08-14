// Copy directories for Vercel deployment - Windows compatible
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function copyDirectory(src, dest) {
  console.log(`📁 Copying ${src} to ${dest}`);
  
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const files = readdirSync(src);
  
  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`📄 Copied ${file}`);
    }
  }
}

try {
  console.log('🚀 Starting directory copy for Vercel deployment...\n');
  
  // Copy the subdirectories to dist
  copyDirectory('docs', 'dist/docs');
  copyDirectory('examples', 'dist/examples');
  copyDirectory('comparison', 'dist/comparison');
  
  // Copy src directory for assets
  console.log('📁 Copying src directory for assets...');
  copyDirectory('src', 'dist/src');
  
  // Copy favicon
  if (existsSync('favicon.svg')) {
    copyFileSync('favicon.svg', 'dist/favicon.svg');
    console.log('📄 Copied favicon.svg');
  }
  
  console.log('\n✅ All directories copied successfully!');
  console.log('📦 Ready for Vercel deployment');
  
} catch (error) {
  console.error('❌ Error copying directories:', error.message);
  process.exit(1);
}
