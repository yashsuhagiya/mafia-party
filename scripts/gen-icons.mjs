import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svg = path.join(root, 'assets', 'logo.svg');

// Install sharp locally if needed
try {
	await import('sharp');
} catch {
	console.log('Installing sharp...');
	execSync('npm install sharp --save-dev --legacy-peer-deps', {
		cwd: root,
		stdio: 'inherit',
	});
}

const sharp = (await import('sharp')).default;

const outputs = [
	{ file: 'icon.png', size: 1024 },
	{ file: 'splash-icon.png', size: 1024 },
	{ file: 'favicon.png', size: 196 },
	{ file: 'android-icon-foreground.png', size: 1024 },
];

for (const { file, size } of outputs) {
	const out = path.join(root, 'assets', file);
	await sharp(Buffer.from(await (await import('fs')).promises.readFile(svg)))
		.resize(size, size)
		.png()
		.toFile(out);
	console.log(`✓ ${file} (${size}x${size})`);
}

// android-icon-background: solid dark color matching logo bg
await sharp({
	create: {
		width: 1024,
		height: 1024,
		channels: 4,
		background: { r: 10, g: 4, b: 3, alpha: 1 },
	},
})
	.png()
	.toFile(path.join(root, 'assets', 'android-icon-background.png'));
console.log('✓ android-icon-background.png');

// android-icon-monochrome: white silhouette version (greyscale)
await sharp(Buffer.from(await (await import('fs')).promises.readFile(svg)))
	.resize(1024, 1024)
	.greyscale()
	.png()
	.toFile(path.join(root, 'assets', 'android-icon-monochrome.png'));
console.log('✓ android-icon-monochrome.png');

console.log('\nAll icons generated successfully!');
