/**
 * Replace `import.meta` references in the exported web bundle with a safe fallback.
 * Zustand's devtools middleware (and other ESM-only code) uses `import.meta.env`,
 * which is a syntax error when Metro outputs a classic script (no type="module").
 */
const fs = require('fs');
const path = require('path');

const BUNDLE_DIR = path.join(__dirname, '..', 'dist', '_expo', 'static', 'js', 'web');

if (!fs.existsSync(BUNDLE_DIR)) {
  console.log('No web bundle found, skipping fix.');
  process.exit(0);
}

const files = fs.readdirSync(BUNDLE_DIR).filter((f) => f.endsWith('.js'));
let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(BUNDLE_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const patched = content.replace(/import\.meta/g, '({env:{}})');
  const count = (content.match(/import\.meta/g) || []).length;
  if (count > 0) {
    fs.writeFileSync(filePath, patched);
    console.log(`  Patched ${file}: ${count} import.meta references`);
    totalReplacements += count;
  }
}

console.log(`Done. Total replacements: ${totalReplacements}`);
