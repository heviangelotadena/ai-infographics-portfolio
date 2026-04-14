/**
 * ThreadPup LinkedIn Carousel Assembler
 *
 * Takes 4 source PNGs, resizes them to fit 1080×1350 slides with
 * branded header/footer, and outputs to carousel-output/.
 *
 * Usage:  node src/build-carousel.js
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = 'c:/Users/ADMIN/Desktop/Infographics';
const OUT_DIR  = path.join(BASE_DIR, 'carousel-output');

// ── Slide dimensions ───────────────────────────────────────────
const SLIDE_W    = 1080;
const SLIDE_H    = 1350;
const HEADER_H   = 110;
const FOOTER_H   = 60;
const CONTENT_H  = SLIDE_H - HEADER_H - FOOTER_H;  // 1180
const CONTENT_W  = SLIDE_W - 80;                     // 1000 (40px padding each side)
const BG_COLOR   = { r: 250, g: 250, b: 247 };      // #FAFAF7

// ── Slide configuration ────────────────────────────────────────
const SLIDES = [
  {
    num: 1,
    title: 'System Architecture',
    accent: '#B8D4E8',
    src: 'generated/threadpup-architecture.png',
  },
  {
    num: 2,
    title: 'Customer Journey',
    accent: '#D4C5E8',
    src: 'generated/threadpup-journey-portrait.png',
  },
  {
    num: 3,
    title: 'Brand Customization',
    accent: '#B8D9C4',
    src: 'generated/threadpup-brand-customization.png',
  },
  {
    num: 4,
    title: 'The Complete Platform',
    accent: '#F2C894',
    src: 'generated/threadpup-overview.png',
  },
];

// ── SVG generators ─────────────────────────────────────────────
function makeHeaderSvg(title, num, accent) {
  return `<svg width="${SLIDE_W}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SLIDE_W}" height="${HEADER_H}" fill="#FAFAF7"/>
  <rect y="${HEADER_H - 6}" width="${SLIDE_W}" height="6" fill="${accent}" opacity="0.7"/>
  <text x="${SLIDE_W / 2}" y="40" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="14" font-weight="600" fill="#6b6b6b" letter-spacing="3">THREADPUP</text>
  <text x="${SLIDE_W / 2}" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="26" font-weight="700" fill="#2d2d2d">${escapeXml(title)}</text>
  <text x="${SLIDE_W - 32}" y="58" text-anchor="end" font-family="Arial, Helvetica, sans-serif"
        font-size="14" fill="#6b6b6b">${num} / ${SLIDES.length}</text>
</svg>`;
}

function makeFooterSvg(accent) {
  return `<svg width="${SLIDE_W}" height="${FOOTER_H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SLIDE_W}" height="${FOOTER_H}" fill="#FAFAF7"/>
  <rect y="0" width="${SLIDE_W}" height="4" fill="${accent}" opacity="0.7"/>
  <text x="${SLIDE_W / 2}" y="38" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="13" fill="#6b6b6b">ThreadPup &#xb7; Premium Dog Merchandise &#xb7; threadpup.com</text>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Build one slide ────────────────────────────────────────────
async function buildSlide(slide) {
  const srcPath = path.join(BASE_DIR, slide.src);

  // Read source image metadata
  const meta = await sharp(srcPath).metadata();
  const srcW = meta.width;
  const srcH = meta.height;

  // Fit within content area
  const scale = Math.min(CONTENT_W / srcW, CONTENT_H / srcH, 1.0);
  const scaledW = Math.round(srcW * scale);
  const scaledH = Math.round(srcH * scale);

  // Center position
  const left = Math.round((SLIDE_W - scaledW) / 2);
  const top  = HEADER_H + Math.round((CONTENT_H - scaledH) / 2);

  // Resize diagram
  const diagramBuf = await sharp(srcPath)
    .resize(scaledW, scaledH, { fit: 'fill' })
    .png()
    .toBuffer();

  // Header SVG
  const headerBuf = Buffer.from(makeHeaderSvg(slide.title, slide.num, slide.accent));

  // Footer SVG
  const footerBuf = Buffer.from(makeFooterSvg(slide.accent));

  // Compose
  const outPath = path.join(OUT_DIR, `slide-0${slide.num}.png`);
  await sharp({
    create: {
      width: SLIDE_W,
      height: SLIDE_H,
      channels: 3,
      background: BG_COLOR,
    },
  })
    .composite([
      { input: headerBuf, top: 0, left: 0 },
      { input: diagramBuf, top, left },
      { input: footerBuf, top: SLIDE_H - FOOTER_H, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`  slide-0${slide.num}.png  ${scaledW}×${scaledH} diagram at (${left}, ${top})  [from ${srcW}×${srcH}, scale ${scale.toFixed(3)}]`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log('Building LinkedIn carousel...\n');

  for (const slide of SLIDES) {
    await buildSlide(slide);
  }

  console.log(`\nDone! ${SLIDES.length} slides saved to: ${OUT_DIR}`);
  console.log('Each slide is 1080×1350px — ready for LinkedIn carousel upload.');
}

main().catch(err => { console.error(err); process.exit(1); });
