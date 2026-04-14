/**
 * ThreadPup Customer Journey – Portrait layout for LinkedIn carousel.
 *
 * Generates a 2-column grid (6 rows × 2 cols) optimised for 1080×1350 slides.
 *
 * Usage:  node src/build-journey-portrait.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeEllipse, makeArrow, makeLine,
  wrapText, bindArrow, makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── ThreadPup Journey palette ──────────────────────────────────
const C = {
  bg:        '#FAFAF7',
  purple:    '#D4C5E8',
  blue:      '#B8D4E8',
  green:     '#B8D9C4',
  orange:    '#F2C894',
  purpleDk:  '#9B7FBF',
  blueDk:    '#6BA3C7',
  greenDk:   '#7BAF96',
  orangeDk:  '#D4A050',
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  white:     '#ffffff',
  legendBg:  '#f5f3ef',
};

// ── Journey stages (same data as build-journey.js) ─────────────
const STAGES = [
  { label: 'Discovery',        desc: 'Social media & Google Ads',  phase: 'awareness' },
  { label: 'Landing Page',     desc: 'threadpup.com homepage',     phase: 'awareness' },
  { label: 'Browse Catalog',   desc: 'Filter by breed & category', phase: 'consideration' },
  { label: 'Customize Shirt',  desc: 'Pick breed, size & design',  phase: 'consideration' },
  { label: 'Add to Cart',      desc: 'Review selections',          phase: 'purchase' },
  { label: 'Checkout',         desc: 'Pay with Stripe',            phase: 'purchase' },
  { label: 'Order Confirmed',  desc: 'Email via Resend',           phase: 'purchase' },
  { label: 'Production',       desc: 'Print shop · 2–3 days',      phase: 'postpurchase' },
  { label: 'Shipping Notice',  desc: 'Tracking email sent',        phase: 'postpurchase' },
  { label: 'Delivery',         desc: 'Package arrives!',           phase: 'postpurchase' },
  { label: 'Review Request',   desc: 'Feedback email',             phase: 'postpurchase' },
  { label: 'Repeat Purchase',  desc: 'Loyal customer!',            phase: 'postpurchase' },
];

const PHASES = {
  awareness:     { color: C.purple,  accent: C.purpleDk,  label: 'Awareness' },
  consideration: { color: C.blue,    accent: C.blueDk,    label: 'Consideration' },
  purchase:      { color: C.green,   accent: C.greenDk,   label: 'Purchase' },
  postpurchase:  { color: C.orange,  accent: C.orangeDk,  label: 'Post-Purchase' },
};

// ── Layout constants ───────────────────────────────────────────
const CW       = 520;    // canvas width
const CARD_W   = 218;
const CARD_H   = 65;
const COL_GAP  = 34;     // wide enough for visible arrowheads
const ROW_GAP  = 24;     // tall enough for visible wrap arrowheads
const COL_0_X  = 25;
const COL_1_X  = COL_0_X + CARD_W + COL_GAP;
const GRID_Y   = 90;     // first row top

// ── Build ──────────────────────────────────────────────────────
function build() {
  const els = [];

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: 20, y: 20,
    text: 'ThreadPup Customer Journey',
    fontSize: 26, color: C.textDark, textAlign: 'center', width: CW - 40,
  }));
  els.push(makeText({
    id: randomUUID(), x: 20, y: 52,
    text: 'From Discovery to Repeat Purchase',
    fontSize: FONT.small, color: C.textMuted, textAlign: 'center', width: CW - 40,
  }));

  // ─── Phase background bands (span full row width) ────────────
  const phaseOrder = ['awareness', 'consideration', 'purchase', 'postpurchase'];
  const phaseRows = {};
  for (let i = 0; i < STAGES.length; i++) {
    const p = STAGES[i].phase;
    if (!phaseRows[p]) phaseRows[p] = [];
    phaseRows[p].push(Math.floor(i / 2));
  }

  for (const pk of phaseOrder) {
    const rows = [...new Set(phaseRows[pk])];
    const firstRow = Math.min(...rows);
    const lastRow  = Math.max(...rows);
    const bandY = GRID_Y + firstRow * (CARD_H + ROW_GAP) - 6;
    const bandH = (lastRow - firstRow + 1) * (CARD_H + ROW_GAP) + 4;
    const band = makeRect({
      id: randomUUID(), x: COL_0_X - 8, y: bandY,
      w: CW - 34, h: bandH,
      fillColor: PHASES[pk].color, strokeColor: 'transparent', roundness: 10,
    });
    band.opacity = 30;
    els.push(band);
  }

  // ─── Cards ───────────────────────────────────────────────────
  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const phase = PHASES[stage.phase];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? COL_0_X : COL_1_X;
    const y = GRID_Y + row * (CARD_H + ROW_GAP);

    // Card rectangle
    els.push(makeRect({
      id: randomUUID(), x, y, w: CARD_W, h: CARD_H,
      fillColor: phase.color, strokeColor: phase.accent, roundness: 10,
    }));

    // Number badge
    const badgeSize = 20;
    const badgeX = x + 8;
    const badgeY = y + 6;
    els.push(makeEllipse({
      id: randomUUID(), x: badgeX, y: badgeY,
      w: badgeSize, h: badgeSize,
      fillColor: phase.accent, strokeColor: phase.accent,
    }));
    els.push(makeText({
      id: randomUUID(), x: badgeX + 2, y: badgeY + 3,
      text: `${i + 1}`, fontSize: 11,
      color: C.white, textAlign: 'center', width: badgeSize - 4,
    }));

    // Stage label
    els.push(makeText({
      id: randomUUID(), x: x + 34, y: y + 8,
      text: stage.label, fontSize: FONT.body,
      color: C.textDark, width: CARD_W - 44,
    }));

    // Description
    els.push(makeText({
      id: randomUUID(), x: x + 34, y: y + 30,
      text: stage.desc, fontSize: FONT.caption,
      color: C.textMuted, width: CARD_W - 44,
    }));

    // Arrow to next card
    if (i < STAGES.length - 1) {
      const nextCol = (i + 1) % 2;
      const nextRow = Math.floor((i + 1) / 2);
      let arrow;
      if (nextCol === 1 && nextRow === row) {
        // Horizontal arrow to right neighbor — 6px clearance each side
        arrow = makeArrow({
          id: randomUUID(),
          x: x + CARD_W + 6, y: y + CARD_H / 2,
          points: [[0, 0], [COL_GAP - 12, 0]],
          color: C.stroke,
        });
      } else {
        // Wrap: L-shaped arrow — down then left, 6px clearance
        const nextY = GRID_Y + nextRow * (CARD_H + ROW_GAP);
        const startX = x + CARD_W / 2;
        const startY = y + CARD_H + 6;
        const endX = COL_0_X + CARD_W / 2;
        const dx = endX - startX;
        const totalDy = nextY - startY - 6;
        const midY = Math.round(totalDy / 2);

        arrow = makeArrow({
          id: randomUUID(),
          x: startX, y: startY,
          points: [[0, 0], [0, midY], [dx, totalDy]],
          color: C.stroke,
        });
      }
      // Thin, crisp arrows with visible triangle arrowheads
      arrow.strokeWidth = 1;
      arrow.roughness = 0;
      arrow.endArrowhead = 'triangle';
      els.push(arrow);
    }
  }

  // ─── Legend ──────────────────────────────────────────────────
  const lastRow = Math.floor((STAGES.length - 1) / 2);
  const legY = GRID_Y + (lastRow + 1) * (CARD_H + ROW_GAP) + 12;
  const swatchSize = 14;
  const legendItems = [
    { color: C.purple, text: 'Awareness' },
    { color: C.blue,   text: 'Consideration' },
    { color: C.green,  text: 'Purchase' },
    { color: C.orange, text: 'Post-Purchase' },
  ];

  for (let i = 0; i < legendItems.length; i++) {
    const sx = COL_0_X + i * 120;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: legY, w: swatchSize, h: swatchSize,
      fillColor: legendItems[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + swatchSize + 6, y: legY,
      text: legendItems[i].text, fontSize: FONT.caption, color: C.textDark,
    }));
  }

  // ─── Footer ──────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: 20, y: legY + 28,
    text: 'ThreadPup · Premium Dog Merchandise · threadpup.com',
    fontSize: FONT.caption, color: C.textMuted,
    textAlign: 'center', width: CW - 40,
  }));

  return els;
}

// ── Main ──────────────────────────────────────────────────────
const BASE_DIR = 'c:/Users/ADMIN/Desktop/Infographics';
const OUT_DIR  = path.join(BASE_DIR, 'generated');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const elements = build();
  const doc = makeDocument(elements, C.bg);

  const excPath = path.resolve(OUT_DIR, 'threadpup-journey-portrait.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const pngPath = path.resolve(OUT_DIR, 'threadpup-journey-portrait.png');
  const cliPath = path.join(BASE_DIR, 'node_modules', '.bin', 'excalidraw-brute-export-cli');

  console.log('Exporting PNG (2x scale)...');
  const pngResult = spawnSync(
    cliPath,
    ['-i', excPath, '-o', pngPath, '--background', '1', '--embed-scene', '0', '--dark-mode', '0', '--scale', '2', '--format', 'png'],
    { cwd: BASE_DIR, encoding: 'utf-8', timeout: 90000, shell: true, env: { ...process.env } },
  );
  if (pngResult.status !== 0) {
    console.error('PNG export FAILED:', pngResult.stderr?.slice(0, 500));
    process.exit(1);
  }
  console.log(`Exported PNG: ${pngPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
