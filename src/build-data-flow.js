/**
 * ThreadPup Customer Order Data Flow – End-to-end diagram showing
 * how a customer order moves through the system, from browse to delivery.
 *
 * Usage:  node src/build-data-flow.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeArrow, makeLine, makeEllipse,
  bindArrow, makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── ThreadPup brand palette ────────────────────────────────────
const TP = {
  bg:        '#FAFAF7',
  blue:      '#B8D4E8',   // customer-facing
  green:     '#B8D9C4',   // backend services
  orange:    '#F2C894',   // third-party / shipping
  lavender:  '#D4C5E8',   // data stores sidebar
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  white:     '#ffffff',
  legendBg:  '#f5f3ef',
};

// ── Layout constants ───────────────────────────────────────────
const CW       = 800;
const MAIN_CX  = 300;
const BOX_W    = 280;
const BOX_H    = 64;
const ARROW_H  = 50;
const PAD      = 14;
const SIDE_X   = 620;     // data stores sidebar
const SIDE_W   = 150;

function makeDashedArrow(opts) {
  const a = makeArrow(opts);
  a.strokeStyle = 'dashed';
  return a;
}

// ── Steps definition ──────────────────────────────────────────
const STEPS = [
  { label: 'Browse Catalog',     desc: 'GET /api/products',            color: TP.blue,   data: 'products\nbreeds[]' },
  { label: 'Customize Product',  desc: 'select breed, size, design',   color: TP.blue,   data: 'product_variants' },
  { label: 'Add to Cart',        desc: 'POST /api/cart',               color: TP.blue,   data: 'cart_items[]' },
  { label: 'Checkout',           desc: 'POST /api/checkout',           color: TP.green,  data: 'orders\norder_items' },
  { label: 'Stripe Payment',     desc: 'Stripe Checkout Session',      color: TP.orange, data: 'payments' },
  { label: 'Fulfillment API',    desc: 'webhook: payment_intent.succeeded', color: TP.green, data: 'fulfillment_jobs' },
  { label: 'Print Shop',         desc: 'print job dispatched',         color: TP.green,  data: 'print_jobs' },
  { label: 'Shipping',           desc: 'tracking number assigned',     color: TP.orange, data: 'shipments' },
  { label: 'Delivery',           desc: 'package arrives at customer',  color: TP.orange, data: null },
];

const ARROW_LABELS = [
  'product data',
  'variant selection',
  'cart payload',
  'order + payment intent',
  'payment confirmed (webhook)',
  'print job payload',
  'tracking number',
  'delivery confirmation',
];

// ── Build ──────────────────────────────────────────────────────
function build() {
  const els = [];
  let Y = 30;

  // Title
  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'Customer Order Data Flow',
    fontSize: 30, color: TP.textDark, textAlign: 'center', width: CW - 40,
  }));
  Y += 40;
  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'How an Order Moves Through ThreadPup',
    fontSize: FONT.small, color: TP.textMuted, textAlign: 'center', width: CW - 40,
  }));
  Y += 32;

  // Sidebar header
  els.push(makeText({
    id: randomUUID(), x: SIDE_X, y: Y - 10,
    text: 'Data Stores', fontSize: FONT.body,
    color: TP.textDark, textAlign: 'center', width: SIDE_W,
  }));
  els.push(makeText({
    id: randomUUID(), x: SIDE_X, y: Y + 10,
    text: '(Supabase)', fontSize: FONT.caption,
    color: TP.textMuted, textAlign: 'center', width: SIDE_W,
  }));

  // Phase dividers
  const phases = [
    { label: 'CUSTOMER', startIdx: 0, endIdx: 2, color: TP.blue },
    { label: 'BACKEND',  startIdx: 3, endIdx: 6, color: TP.green },
    { label: 'SHIPPING', startIdx: 7, endIdx: 8, color: TP.orange },
  ];

  // Draw steps
  const boxes = [];
  const boxPositions = [];

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const boxX = MAIN_CX - BOX_W / 2;

    // Badge number
    const badgeSize = 26;
    els.push(makeRect({
      id: randomUUID(),
      x: boxX - badgeSize - 10, y: Y + (BOX_H - badgeSize) / 2,
      w: badgeSize, h: badgeSize,
      fillColor: step.color, roundness: 13,
    }));
    els.push(makeText({
      id: randomUUID(),
      x: boxX - badgeSize - 8, y: Y + (BOX_H - badgeSize) / 2 + 5,
      text: `${i + 1}`, fontSize: FONT.body,
      color: TP.textDark, textAlign: 'center', width: badgeSize - 4,
    }));

    // Main box
    const boxId = randomUUID();
    const box = makeRect({
      id: boxId, x: boxX, y: Y, w: BOX_W, h: BOX_H,
      fillColor: step.color, roundness: 12,
    });
    els.push(box);
    boxes.push(box);
    boxPositions.push({ x: boxX, y: Y });

    // Label
    els.push(makeText({
      id: randomUUID(), x: boxX + PAD, y: Y + 10,
      text: step.label, fontSize: FONT.heading,
      color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
    }));
    els.push(makeText({
      id: randomUUID(), x: boxX + PAD, y: Y + 38,
      text: step.desc, fontSize: FONT.caption,
      color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
    }));

    // Data store sidebar entry (dashed arrow to right)
    if (step.data) {
      const dsY = Y + 6;
      const dsH = 40;
      els.push(makeRect({
        id: randomUUID(), x: SIDE_X, y: dsY, w: SIDE_W, h: dsH,
        fillColor: TP.lavender, roundness: 6, strokeStyle: 'dashed',
      }));
      els.push(makeText({
        id: randomUUID(), x: SIDE_X + 6, y: dsY + 4,
        text: step.data, fontSize: FONT.caption,
        color: TP.textDark, textAlign: 'center', width: SIDE_W - 12,
      }));

      // Dashed connector
      const da = makeDashedArrow({
        id: randomUUID(),
        x: boxX + BOX_W + 4, y: Y + BOX_H / 2,
        points: [[0, 0], [SIDE_X - boxX - BOX_W - 8, dsY + dsH / 2 - Y - BOX_H / 2]],
        color: TP.textMuted,
      });
      els.push(da);
    }

    const boxBottom = Y + BOX_H;

    // Arrow to next step
    if (i < STEPS.length - 1) {
      const arrow = makeArrow({
        id: randomUUID(),
        x: MAIN_CX, y: boxBottom + 4,
        points: [[0, 0], [0, ARROW_H - 8]],
        color: TP.stroke,
      });
      arrow.startBinding = { elementId: box.id, focus: 0, gap: 4, fixedPoint: null };
      box.boundElements = [...(box.boundElements || []), { type: 'arrow', id: arrow.id }];
      els.push(arrow);

      // Arrow data label
      els.push(makeText({
        id: randomUUID(),
        x: MAIN_CX + 10, y: boxBottom + 12,
        text: ARROW_LABELS[i], fontSize: FONT.caption, color: TP.textMuted,
      }));
    }

    Y = boxBottom + ARROW_H;
  }

  // Bind arrow end-bindings retroactively
  const arrows = els.filter(e => e.type === 'arrow' && e.startBinding && !e.endBinding);
  for (let i = 0; i < arrows.length; i++) {
    if (boxes[i + 1]) {
      arrows[i].endBinding = { elementId: boxes[i + 1].id, focus: 0, gap: 4, fixedPoint: null };
      boxes[i + 1].boundElements = [
        ...(boxes[i + 1].boundElements || []),
        { type: 'arrow', id: arrows[i].id },
      ];
    }
  }

  // Phase labels on left margin
  let phaseY = 62; // first step Y
  for (const phase of phases) {
    const startY = 62 + phase.startIdx * (BOX_H + ARROW_H);
    const endY = 62 + phase.endIdx * (BOX_H + ARROW_H) + BOX_H;
    const midY = (startY + endY) / 2;

    // Vertical bracket line
    els.push(makeLine({
      id: randomUUID(),
      x: MAIN_CX - BOX_W / 2 - 60, y: startY + 10,
      points: [[0, 0], [0, endY - startY - 20]],
      color: phase.color, strokeStyle: 'solid',
    }));

    // Phase label
    els.push(makeText({
      id: randomUUID(),
      x: MAIN_CX - BOX_W / 2 - 100, y: midY - 8,
      text: phase.label, fontSize: FONT.caption,
      color: phase.color,
    }));
  }

  // ── Legend ───────────────────────────────────────────────────
  const legY = Y - ARROW_H + 20;
  const legW = 520, legH = 90;
  const legX = (CW - legW) / 2;

  els.push(makeRect({
    id: randomUUID(), x: legX, y: legY, w: legW, h: legH,
    fillColor: TP.legendBg, strokeColor: TP.stroke, roundness: 10,
  }));
  els.push(makeText({
    id: randomUUID(), x: legX + 16, y: legY + 8,
    text: 'Legend', fontSize: FONT.body, color: TP.textDark,
  }));
  els.push(makeLine({
    id: randomUUID(), x: legX + 16, y: legY + 28,
    points: [[0, 0], [legW - 32, 0]], color: TP.stroke, strokeStyle: 'solid',
  }));

  const swatches = [
    { color: TP.blue,    text: 'Customer-Facing' },
    { color: TP.green,   text: 'Backend' },
    { color: TP.orange,  text: 'Third-Party' },
    { color: TP.lavender, text: 'Data Store' },
  ];
  for (let i = 0; i < swatches.length; i++) {
    const sx = legX + 20 + i * 126;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: legY + 40, w: 14, h: 14,
      fillColor: swatches[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + 20, y: legY + 41,
      text: swatches[i].text, fontSize: FONT.caption, color: TP.textDark,
    }));
  }

  // Footer
  els.push(makeText({
    id: randomUUID(), x: legX, y: legY + legH + 10,
    text: 'Data stored in Supabase (PostgreSQL) \u00b7 Payments via Stripe \u00b7 Email via Resend',
    fontSize: FONT.caption, color: TP.textMuted,
    textAlign: 'center', width: legW,
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

  const excPath = path.resolve(OUT_DIR, 'threadpup-data-flow.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const cliPath = path.join(BASE_DIR, 'node_modules', '.bin', 'excalidraw-brute-export-cli');

  // Export PNG
  console.log('Exporting PNG (2x scale)...');
  const pngPath = path.resolve(OUT_DIR, 'threadpup-data-flow.png');
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

  // Export SVG
  const svgPath = path.resolve(OUT_DIR, 'threadpup-data-flow.svg');
  console.log('Exporting SVG...');
  const svgResult = spawnSync(
    cliPath,
    ['-i', excPath, '-o', svgPath, '--background', '1', '--embed-scene', '0', '--dark-mode', '0', '--scale', '2', '--format', 'svg'],
    { cwd: BASE_DIR, encoding: 'utf-8', timeout: 90000, shell: true, env: { ...process.env } },
  );
  if (svgResult.status !== 0) {
    console.error('SVG export FAILED:', svgResult.stderr?.slice(0, 500));
  } else {
    console.log(`Exported SVG: ${svgPath}`);
  }

  console.log('\nDone! Files:');
  console.log(`  Excalidraw: ${excPath}`);
  console.log(`  PNG (2x):   ${pngPath}`);
  if (svgResult.status === 0) console.log(`  SVG:        ${svgPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
