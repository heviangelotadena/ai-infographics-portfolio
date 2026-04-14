/**
 * ThreadPup Fulfillment Pipeline – Vertical flow with email sidebar.
 *
 * Order Confirmed → Fulfillment API → Print Shop → Shipping → Delivery
 * + Resend email notification triggers
 *
 * Usage:  node src/build-fulfillment.js
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
  blue:      '#B8D4E8',
  green:     '#B8D9C4',
  orange:    '#F2C894',
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  legendBg:  '#f5f3ef',
};

// ── Helper: dashed arrow ───────────────────────────────────────
function makeDashedArrow(opts) {
  const a = makeArrow(opts);
  a.strokeStyle = 'dashed';
  return a;
}

// ── Layout constants ───────────────────────────────────────────
const CW       = 500;
const MAIN_W   = 260;       // main flow box width
const MAIN_X   = 30;        // left edge of main column
const MAIN_CX  = MAIN_X + MAIN_W / 2;
const BOX_H    = 70;
const ARROW_H  = 44;
const PAD      = 14;

// Sidebar (email notifications)
const SIDE_W   = 140;
const SIDE_X   = 340;
const SIDE_H   = 52;

// ── Steps ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Order Confirmed',  desc: 'Stripe webhook fires',         color: TP.green,  email: 'Order\nReceipt' },
  { label: 'Fulfillment API',  desc: 'Job queued for production',    color: TP.green,  email: null },
  { label: 'Print Shop',       desc: 'Custom merch printed · 2–3d',  color: TP.green,  email: null },
  { label: 'Shipping',         desc: 'Package dispatched + tracking', color: TP.orange, email: 'Shipping\nNotification' },
  { label: 'Delivery',         desc: 'Package arrives!',             color: TP.orange, email: 'Delivery\nUpdate' },
];

// ── Build ──────────────────────────────────────────────────────
function build() {
  const els = [];
  let Y = 30;

  // Title
  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'Fulfillment Pipeline',
    fontSize: 28, color: TP.textDark, textAlign: 'center', width: CW - 40,
  }));
  Y += 38;

  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'From Payment to Doorstep',
    fontSize: FONT.small, color: TP.textMuted, textAlign: 'center', width: CW - 40,
  }));
  Y += 36;

  // Sidebar header
  els.push(makeText({
    id: randomUUID(), x: SIDE_X, y: Y - 8,
    text: 'Resend', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: SIDE_W,
  }));
  els.push(makeText({
    id: randomUUID(), x: SIDE_X, y: Y + 16,
    text: 'Email Notifications', fontSize: FONT.caption,
    color: TP.textMuted, textAlign: 'center', width: SIDE_W,
  }));

  // Main flow boxes + arrows
  const boxes = [];
  let emailIdx = 0;

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];

    // Step number badge
    const badgeSize = 26;
    els.push(makeRect({
      id: randomUUID(),
      x: MAIN_X - badgeSize - 4, y: Y + (BOX_H - badgeSize) / 2,
      w: badgeSize, h: badgeSize,
      fillColor: step.color, roundness: 13,
    }));
    els.push(makeText({
      id: randomUUID(),
      x: MAIN_X - badgeSize - 2, y: Y + (BOX_H - badgeSize) / 2 + 4,
      text: `${i + 1}`, fontSize: FONT.body,
      color: TP.textDark, textAlign: 'center', width: badgeSize - 4,
    }));

    // Main box
    const boxId = randomUUID();
    const box = makeRect({
      id: boxId, x: MAIN_X, y: Y, w: MAIN_W, h: BOX_H,
      fillColor: step.color, roundness: 12,
    });
    els.push(box);
    boxes.push(box);

    // Label
    els.push(makeText({
      id: randomUUID(), x: MAIN_X + PAD, y: Y + 12,
      text: step.label, fontSize: FONT.heading,
      color: TP.textDark, textAlign: 'center', width: MAIN_W - PAD * 2,
    }));

    // Description
    els.push(makeText({
      id: randomUUID(), x: MAIN_X + PAD, y: Y + 40,
      text: step.desc, fontSize: FONT.small,
      color: TP.textMuted, textAlign: 'center', width: MAIN_W - PAD * 2,
    }));

    // Email notification sidebar box + dashed arrow
    if (step.email) {
      const emailY = Y + (BOX_H - SIDE_H) / 2;
      const emailId = randomUUID();
      els.push(makeRect({
        id: emailId, x: SIDE_X, y: emailY, w: SIDE_W, h: SIDE_H,
        fillColor: TP.orange, roundness: 8,
      }));
      els.push(makeText({
        id: randomUUID(), x: SIDE_X + 10, y: emailY + 8,
        text: step.email, fontSize: FONT.body,
        color: TP.textDark, textAlign: 'center', width: SIDE_W - 20,
      }));

      // Dashed arrow from main box to email box
      const arrowStartX = MAIN_X + MAIN_W + 4;
      const arrowStartY = Y + BOX_H / 2;
      const arrowEndX = SIDE_X - 4;
      els.push(makeDashedArrow({
        id: randomUUID(),
        x: arrowStartX, y: arrowStartY,
        points: [[0, 0], [arrowEndX - arrowStartX, 0]],
        color: TP.textMuted,
      }));

      // Trigger label
      const triggers = { 'Order\nReceipt': 'on payment', 'Shipping\nNotification': 'on dispatch', 'Delivery\nUpdate': 'on delivered' };
      const triggerText = triggers[step.email] || '';
      if (triggerText) {
        els.push(makeText({
          id: randomUUID(),
          x: arrowStartX + 4, y: arrowStartY - 16,
          text: triggerText, fontSize: FONT.caption, color: TP.textMuted,
        }));
      }

      emailIdx++;
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
      // startBinding only — endBinding set retroactively below
      arrow.startBinding = { elementId: box.id, focus: 0, gap: 4, fixedPoint: null };
      box.boundElements = [...(box.boundElements || []), { type: 'arrow', id: arrow.id }];
      els.push(arrow);

      // Arrow label
      const labels = ['queue job', 'send to print', 'ship order', 'out for delivery'];
      els.push(makeText({
        id: randomUUID(),
        x: MAIN_CX + 10, y: boxBottom + 12,
        text: labels[i], fontSize: FONT.caption, color: TP.textMuted,
      }));
    }

    Y = boxBottom + ARROW_H;
  }

  // Bind arrow end-bindings
  const arrows = els.filter(e => e.type === 'arrow' && e.strokeStyle !== 'dashed');
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
  const legW = 420;
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
    { color: TP.green,  text: 'Backend Services' },
    { color: TP.orange, text: 'Shipping / Email' },
  ];
  for (let i = 0; i < swatches.length; i++) {
    const sx = legX + 30 + i * 180;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: legY + 32, w: 14, h: 14,
      fillColor: swatches[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + 20, y: legY + 33,
      text: swatches[i].text, fontSize: FONT.caption, color: TP.textDark,
    }));
  }

  // Dashed line legend entry
  els.push(makeLine({
    id: randomUUID(), x: legX + 30 + 2 * 140, y: legY + 39,
    points: [[0, 0], [30, 0]], color: TP.textMuted, strokeStyle: 'dashed',
  }));
  els.push(makeText({
    id: randomUUID(), x: legX + 30 + 2 * 140 + 36, y: legY + 33,
    text: 'Email trigger', fontSize: FONT.caption, color: TP.textDark,
  }));

  // Footer
  els.push(makeText({
    id: randomUUID(), x: 20, y: legY + 66,
    text: 'Email notifications powered by Resend',
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

  const excPath = path.resolve(OUT_DIR, 'threadpup-fulfillment.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const pngPath = path.resolve(OUT_DIR, 'threadpup-fulfillment.png');
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
