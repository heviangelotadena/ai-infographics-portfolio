/**
 * ThreadPup Brand Customization – Shows 3 color palette variations
 * of a simplified architecture flow to demonstrate customizability.
 *
 * Usage:  node src/build-brand-customization.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeArrow, makeLine,
  makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── Three brand palettes ───────────────────────────────────────
const PALETTES = [
  {
    name: 'ThreadPup Original',
    bg:      '#FAFAF7',
    primary: '#B8D4E8',
    secondary: '#B8D9C4',
    accent:  '#F2C894',
    stroke:  '#4a4a4a',
    textDark:'#2d2d2d',
    textMuted:'#6b6b6b',
  },
  {
    name: 'Corporate Slate',
    bg:      '#F4F6F8',
    primary: '#A8C4D8',
    secondary: '#B0BEC5',
    accent:  '#7E9AAB',
    stroke:  '#37474F',
    textDark:'#263238',
    textMuted:'#546E7A',
  },
  {
    name: 'Warm Sunset',
    bg:      '#FFF8F0',
    primary: '#F4C9A8',
    secondary: '#E8A598',
    accent:  '#D4A373',
    stroke:  '#5D4037',
    textDark:'#3E2723',
    textMuted:'#795548',
  },
];

// ── Layout constants ───────────────────────────────────────────
const CW = 520;
const COL_W = 145;
const COL_GAP = 20;
const TOTAL_W = COL_W * 3 + COL_GAP * 2;
const START_X = (CW - TOTAL_W) / 2;

const MINI_BOX_W = 120;
const MINI_BOX_H = 36;
const MINI_GAP = 10;  // vertical gap between mini boxes
const ARROW_H = 14;

// Mini flow: 4 boxes representing the simplified architecture
const FLOW_STEPS = [
  { label: 'Storefront',      key: 'primary' },
  { label: 'Supabase',        key: 'accent' },
  { label: 'Fulfillment',     key: 'secondary' },
  { label: 'Print Shop',      key: 'secondary' },
];

function build() {
  const els = [];

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: 20, y: 24,
    text: 'Brand Customization',
    fontSize: 26, color: '#2d2d2d', textAlign: 'center', width: CW - 40,
  }));
  els.push(makeText({
    id: randomUUID(), x: 20, y: 56,
    text: 'Same Architecture, Different Palettes',
    fontSize: FONT.small, color: '#6b6b6b', textAlign: 'center', width: CW - 40,
  }));

  const colStartY = 88;

  for (let p = 0; p < PALETTES.length; p++) {
    const pal = PALETTES[p];
    const colX = START_X + p * (COL_W + COL_GAP);
    const boxX = colX + (COL_W - MINI_BOX_W) / 2;
    let Y = colStartY;

    // Palette name label
    els.push(makeText({
      id: randomUUID(), x: colX, y: Y,
      text: pal.name, fontSize: FONT.body,
      color: pal.textDark, textAlign: 'center', width: COL_W,
    }));
    Y += 26;

    // Color swatch row (3 circles)
    const swatchSize = 16;
    const swatchGap = 8;
    const swatches = [pal.primary, pal.secondary, pal.accent];
    const swatchTotalW = swatches.length * swatchSize + (swatches.length - 1) * swatchGap;
    const swatchStartX = colX + (COL_W - swatchTotalW) / 2;
    for (let s = 0; s < swatches.length; s++) {
      els.push(makeRect({
        id: randomUUID(),
        x: swatchStartX + s * (swatchSize + swatchGap), y: Y,
        w: swatchSize, h: swatchSize,
        fillColor: swatches[s], roundness: 8,
      }));
    }
    Y += swatchSize + 14;

    // Background card for the mini-flow
    const flowH = FLOW_STEPS.length * (MINI_BOX_H + MINI_GAP + ARROW_H) - MINI_GAP - ARROW_H + 20;
    els.push(makeRect({
      id: randomUUID(), x: colX + 2, y: Y,
      w: COL_W - 4, h: flowH,
      fillColor: pal.bg, strokeColor: pal.stroke, roundness: 10,
      strokeStyle: 'solid',
    }));

    const flowStartY = Y + 10;

    // Mini flow boxes + arrows
    for (let i = 0; i < FLOW_STEPS.length; i++) {
      const step = FLOW_STEPS[i];
      const fillColor = pal[step.key];
      const bY = flowStartY + i * (MINI_BOX_H + MINI_GAP + ARROW_H);

      // Box
      els.push(makeRect({
        id: randomUUID(), x: boxX, y: bY,
        w: MINI_BOX_W, h: MINI_BOX_H,
        fillColor, strokeColor: pal.stroke, roundness: 8,
      }));

      // Label
      els.push(makeText({
        id: randomUUID(), x: boxX + 6, y: bY + 9,
        text: step.label, fontSize: FONT.small,
        color: pal.textDark, textAlign: 'center', width: MINI_BOX_W - 12,
      }));

      // Arrow to next
      if (i < FLOW_STEPS.length - 1) {
        const arrowX = boxX + MINI_BOX_W / 2;
        const arrowY = bY + MINI_BOX_H + 2;
        els.push(makeArrow({
          id: randomUUID(),
          x: arrowX, y: arrowY,
          points: [[0, 0], [0, MINI_GAP + ARROW_H - 4]],
          color: pal.stroke,
        }));
      }
    }
  }

  // ─── Bottom section: hex codes for each palette ──────────────
  const bottomY = colStartY + 380;

  for (let p = 0; p < PALETTES.length; p++) {
    const pal = PALETTES[p];
    const colX = START_X + p * (COL_W + COL_GAP);

    // Hex codes
    const hexes = [
      pal.primary.toUpperCase(),
      pal.secondary.toUpperCase(),
      pal.accent.toUpperCase(),
    ];
    els.push(makeText({
      id: randomUUID(), x: colX, y: bottomY,
      text: hexes.join('\n'), fontSize: 10,
      color: pal.textMuted, textAlign: 'center', width: COL_W,
    }));
  }

  // ─── Footer ──────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: 20, y: bottomY + 50,
    text: 'Excalidraw diagrams adapt to any brand palette',
    fontSize: FONT.caption, color: '#6b6b6b',
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
  const doc = makeDocument(elements, '#FAFAF7');

  const excPath = path.resolve(OUT_DIR, 'threadpup-brand-customization.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const pngPath = path.resolve(OUT_DIR, 'threadpup-brand-customization.png');
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
