/**
 * ThreadPup Order Processing Flow – Vertical step-by-step diagram.
 *
 * Browse → Customize → Cart → Checkout → Pay with Stripe
 *
 * Usage:  node src/build-order-flow.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeArrow, makeLine,
  bindArrow, makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── ThreadPup brand palette ────────────────────────────────────
const TP = {
  bg:        '#FAFAF7',
  blue:      '#B8D4E8',   // customer-facing / browsing
  green:     '#B8D9C4',   // transaction steps
  orange:    '#F2C894',   // third-party (Stripe)
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  legendBg:  '#f5f3ef',
};

// ── Layout constants ───────────────────────────────────────────
const CW      = 500;
const BOX_W   = 320;
const BOX_H   = 70;
const BOX_X   = (CW - BOX_W) / 2;  // centered
const CX      = CW / 2;
const ARROW_H = 40;
const PAD     = 16;

// ── Steps ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Browse Catalog',   desc: 'Filter by breed & category',       color: TP.blue },
  { label: 'Customize Shirt',  desc: 'Pick breed, size & design',        color: TP.blue },
  { label: 'Add to Cart',      desc: 'Review selections & quantities',   color: TP.green },
  { label: 'Checkout',         desc: 'Enter shipping & payment details', color: TP.green },
  { label: 'Pay with Stripe',  desc: 'Secure payment processing',        color: TP.orange },
];

// ── Build ──────────────────────────────────────────────────────
function build() {
  const els = [];
  let Y = 30;

  // Title
  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'Order Processing Flow',
    fontSize: 28, color: TP.textDark, textAlign: 'center', width: CW - 40,
  }));
  Y += 38;

  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'From Browse to Checkout',
    fontSize: FONT.small, color: TP.textMuted, textAlign: 'center', width: CW - 40,
  }));
  Y += 32;

  // Steps
  const boxes = [];
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    // Step number badge (left of box)
    const badgeSize = 28;
    els.push(makeRect({
      id: randomUUID(),
      x: BOX_X - badgeSize - 12, y: Y + (BOX_H - badgeSize) / 2,
      w: badgeSize, h: badgeSize,
      fillColor: step.color, roundness: 14,
    }));
    els.push(makeText({
      id: randomUUID(),
      x: BOX_X - badgeSize - 10, y: Y + (BOX_H - badgeSize) / 2 + 5,
      text: `${i + 1}`, fontSize: FONT.body,
      color: TP.textDark, textAlign: 'center', width: badgeSize - 4,
    }));

    // Box
    const boxId = randomUUID();
    const box = makeRect({
      id: boxId, x: BOX_X, y: Y, w: BOX_W, h: BOX_H,
      fillColor: step.color, roundness: 12,
    });
    els.push(box);
    boxes.push(box);

    // Label
    els.push(makeText({
      id: randomUUID(), x: BOX_X + PAD, y: Y + 12,
      text: step.label, fontSize: FONT.heading,
      color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
    }));

    // Description
    els.push(makeText({
      id: randomUUID(), x: BOX_X + PAD, y: Y + 40,
      text: step.desc, fontSize: FONT.small,
      color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
    }));

    const boxBottom = Y + BOX_H;

    // Arrow to next step
    if (i < STEPS.length - 1) {
      const arrow = makeArrow({
        id: randomUUID(),
        x: CX, y: boxBottom + 4,
        points: [[0, 0], [0, ARROW_H - 8]],
        color: TP.stroke,
      });
      // startBinding only — endBinding set retroactively below
      arrow.startBinding = { elementId: box.id, focus: 0, gap: 4, fixedPoint: null };
      box.boundElements = [...(box.boundElements || []), { type: 'arrow', id: arrow.id }];
      els.push(arrow);

      // Arrow label
      const labels = ['select product', 'configure', 'review order', 'process payment'];
      els.push(makeText({
        id: randomUUID(),
        x: CX + 10, y: boxBottom + 10,
        text: labels[i], fontSize: FONT.caption, color: TP.textMuted,
      }));
    }

    Y = boxBottom + ARROW_H;
  }

  // Bind arrow end-bindings retroactively
  const arrows = els.filter(e => e.type === 'arrow');
  for (let i = 0; i < arrows.length; i++) {
    if (boxes[i + 1]) {
      arrows[i].endBinding = { elementId: boxes[i + 1].id, focus: 0, gap: 4, fixedPoint: null };
      boxes[i + 1].boundElements = [
        ...(boxes[i + 1].boundElements || []),
        { type: 'arrow', id: arrows[i].id },
      ];
    }
  }

  // Legend
  const legY = Y + 4;
  const legW = 380;
  const legX = (CW - legW) / 2;
  els.push(makeRect({
    id: randomUUID(), x: legX, y: legY, w: legW, h: 56,
    fillColor: TP.legendBg, strokeColor: TP.stroke, roundness: 8,
  }));
  els.push(makeText({
    id: randomUUID(), x: legX + 12, y: legY + 6,
    text: 'Legend', fontSize: FONT.small, color: TP.textDark,
  }));
  els.push(makeLine({
    id: randomUUID(), x: legX + 12, y: legY + 22,
    points: [[0, 0], [legW - 24, 0]], color: TP.stroke, strokeStyle: 'solid',
  }));

  const swatches = [
    { color: TP.blue,   text: 'Browsing' },
    { color: TP.green,  text: 'Transaction' },
    { color: TP.orange, text: 'Payment' },
  ];
  for (let i = 0; i < swatches.length; i++) {
    const sx = legX + 20 + i * 124;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: legY + 32, w: 14, h: 14,
      fillColor: swatches[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + 20, y: legY + 33,
      text: swatches[i].text, fontSize: FONT.caption, color: TP.textDark,
    }));
  }

  // Footer
  els.push(makeText({
    id: randomUUID(), x: 20, y: legY + 66,
    text: 'Payments processed securely by Stripe',
    fontSize: FONT.caption, color: TP.textMuted,
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
  const doc = makeDocument(elements, TP.bg);

  const excPath = path.resolve(OUT_DIR, 'threadpup-order-flow.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const pngPath = path.resolve(OUT_DIR, 'threadpup-order-flow.png');
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
