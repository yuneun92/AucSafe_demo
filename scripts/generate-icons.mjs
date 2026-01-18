import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <g fill="white">
    <path d="M160 160h192v232H160z" fill="none" stroke="white" stroke-width="24"/>
    <rect x="192" y="192" width="40" height="40" rx="4"/>
    <rect x="280" y="192" width="40" height="40" rx="4"/>
    <rect x="192" y="264" width="40" height="40" rx="4"/>
    <rect x="280" y="264" width="40" height="40" rx="4"/>
    <rect x="224" y="336" width="64" height="56"/>
    <circle cx="380" cy="380" r="80" fill="#22c55e"/>
    <path d="M350 380 L370 400 L410 350" fill="none" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');
}

generateIcons().catch(console.error);
