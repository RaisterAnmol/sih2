const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const zipPath = path.join(rootDir, 'mplad-insight-sih2026.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Temporary directory for clean export
const tempDir = path.join(rootDir, '.temp_zip_export');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

const excludeList = [
  'node_modules',
  '.venv',
  'dist',
  '.git',
  '.pytest_cache',
  '__pycache__',
  '.temp_zip_export',
  'mplad-insight-sih2026.zip'
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (excludeList.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Gathering clean source files...');
copyDir(rootDir, tempDir);

console.log('Creating zip archive with PowerShell Compress-Archive...');
try {
  execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`, {
    stdio: 'inherit'
  });
  console.log(`Zip archive created successfully at: ${zipPath}`);
} finally {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const stats = fs.statSync(zipPath);
console.log(`Final Archive Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
