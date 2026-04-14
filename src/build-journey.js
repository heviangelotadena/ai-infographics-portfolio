/**
 * ThreadPup Customer Journey – Excalidraw horizontal timeline.
 *
 * Generates an .excalidraw file + PNG (2x) + SVG.
 *
 * Usage:  node src/build-journey.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeEllipse, makeArrow, makeLine,
  makeDiamond, wrapText, bindArrow, makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── ThreadPup Journey palette ──────────────────────────────────
const C = {
  bg:        '#FAFAF7',
  purple:    '#D4C5E8',   // Awareness
  blue:      '#B8D4E8',   // Consideration
  green:     '#B8D9C4',   // Purchase
  orange:    '#F2C894',   // Post-purchase
  purpleDk:  '#9B7FBF',   // phase label accent
  blueDk:    '#6BA3C7',
  greenDk:   '#7BAF96',
  orangeDk:  '#D4A050',
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  white:     '#ffffff',
  legendBg:  '#f5f3ef',
};

// ── Journey stages ─────────────────────────────────────────────
const STAGES = [
  { label: 'Discovery',           desc: 'Social media\n& Google Ads',   phase: 'awareness' },
  { label: 'Landing\nPage',       desc: 'threadpup.com\nhomepage',      phase: 'awareness' },
  { label: 'Browse\nCatalog',     desc: 'Filter by breed\n& category',  phase: 'consideration' },
  { label: 'Customize\nShirt',    desc: 'Pick breed,\nsize & design',   phase: 'consideration' },
  { label: 'Add to\nCart',        desc: 'Review\nselections',           phase: 'purchase' },
  { label: 'Checkout',            desc: 'Pay with\nStripe',             phase: 'purchase' },
  { label: 'Order\nConfirmation', desc: 'Email via\nResend',            phase: 'purchase' },
  { label: 'Production',          desc: 'Print shop\n2\u20133 days',    phase: 'postpurchase' },
  { label: 'Shipping\nNotice',    desc: 'Tracking\nemail sent',         phase: 'postpurchase' },
  { label: 'Delivery',            desc: 'Package\narrives!',            phase: 'postpurchase' },
  { label: 'Review\nRequest',     desc: 'Feedback\nemail',              phase: 'postpurchase' },
  { label: 'Repeat\nPurchase',    desc: 'Loyal\ncustomer!',             phase: 'postpurchase' },
];

const PHASES = {
  awareness:     { color: C.purple,  accent: C.purpleDk,  label: 'Awareness' },
  consideration: { color: C.blue,    accent: C.blueDk,    label: 'Consideration' },
  purchase:      { color: C.green,   accent: C.greenDk,   label: 'Purchase' },
  postpurchase:  { color: C.orange,  accent: C.orangeDk,  label: 'Post-Purchase' },
};

// ── Layout constants ───────────────────────────────────────────
const NODE_W = 130;
const NODE_H = 66;
const GAP    = 50;          // horizontal gap between nodes (arrow space)
const STEP   = NODE_W + GAP;   // 180px per stage
const START_X = 100;        // left margin
const TIMELINE_Y = 340;     // vertical center of timeline row
const CW = START_X + STAGES.length * STEP + 40; // canvas width
const CH = 700;             // canvas height

// ── Helper: dashed arrow ───────────────────────────────────────
function makeDashedArrow(opts) {
  const a = makeArrow(opts);
  a.strokeStyle = 'dashed';
  return a;
}

// ── Build elements ─────────────────────────────────────────────
function build() {
  const els = [];

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: (CW - 900) / 2, y: 30,
    text: 'ThreadPup Customer Journey',
    fontSize: 36, color: C.textDark, textAlign: 'center', width: 900,
  }));
  els.push(makeText({
    id: randomUUID(), x: (CW - 900) / 2, y: 78,
    text: 'From Discovery to Repeat Purchase — The Complete Dog Merch Experience',
    fontSize: FONT.small, color: C.textMuted, textAlign: 'center', width: 900,
  }));

  // ─── Phase background bands ──────────────────────────────────
  // Group stages by phase and draw a soft background band behind each group
  const phaseOrder = ['awareness', 'consideration', 'purchase', 'postpurchase'];
  const bandY = 120;
  const bandH = 380;

  for (const phaseKey of phaseOrder) {
    const phase = PHASES[phaseKey];
    const indices = STAGES.map((s, i) => s.phase === phaseKey ? i : -1).filter(i => i >= 0);
    const firstIdx = indices[0];
    const lastIdx = indices[indices.length - 1];
    const bandX = START_X + firstIdx * STEP - 20;
    const bandW = (lastIdx - firstIdx + 1) * STEP + 16;

    // Subtle background band
    els.push(makeRect({
      id: randomUUID(), x: bandX, y: bandY, w: bandW, h: bandH,
      fillColor: phase.color, strokeColor: 'transparent', roundness: 16,
    }));
    // Subtle but visible
    els[els.length - 1].opacity = 40;

    // Phase label — larger and bolder, centered above the band
    els.push(makeText({
      id: randomUUID(),
      x: bandX + 10, y: bandY + 12,
      text: phase.label, fontSize: FONT.heading,
      color: phase.accent, textAlign: 'center', width: bandW - 20,
    }));
  }

  // ─── Timeline base line ──────────────────────────────────────
  const lineStartX = START_X + NODE_W / 2 - 10;
  const lineEndX = START_X + (STAGES.length - 1) * STEP + NODE_W / 2 + 10;
  els.push(makeLine({
    id: randomUUID(),
    x: lineStartX, y: TIMELINE_Y + NODE_H / 2,
    points: [[0, 0], [lineEndX - lineStartX, 0]],
    color: C.stroke, strokeStyle: 'solid',
  }));

  // ─── Stage nodes + arrows ────────────────────────────────────
  const nodeEls = [];   // store node elements for arrow binding

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const phase = PHASES[stage.phase];
    const cx = START_X + i * STEP + NODE_W / 2;
    const nodeX = START_X + i * STEP;
    const nodeY = TIMELINE_Y;

    // Node rounded rectangle
    const nodeId = randomUUID();
    const node = makeRect({
      id: nodeId, x: nodeX, y: nodeY, w: NODE_W, h: NODE_H,
      fillColor: phase.color, strokeColor: phase.accent, roundness: 12,
    });
    els.push(node);
    nodeEls.push(node);

    // Stage number badge (small circle above node)
    const badgeSize = 24;
    const badge = makeEllipse({
      id: randomUUID(),
      x: cx - badgeSize / 2, y: nodeY - badgeSize - 8,
      w: badgeSize, h: badgeSize,
      fillColor: phase.accent, strokeColor: phase.accent,
    });
    els.push(badge);
    els.push(makeText({
      id: randomUUID(),
      x: cx - 8, y: nodeY - badgeSize - 4,
      text: `${i + 1}`, fontSize: 12,
      color: C.white, textAlign: 'center', width: 16,
    }));

    // Stage label inside node
    els.push(makeText({
      id: randomUUID(),
      x: nodeX + 8, y: nodeY + 8,
      text: stage.label, fontSize: FONT.body,
      color: C.textDark, textAlign: 'center', width: NODE_W - 16,
    }));

    // Description below node
    els.push(makeText({
      id: randomUUID(),
      x: nodeX - 4, y: nodeY + NODE_H + 10,
      text: stage.desc, fontSize: FONT.caption,
      color: C.textMuted, textAlign: 'center', width: NODE_W + 8,
    }));

    // Arrow to next node
    if (i < STAGES.length - 1) {
      const arrowX = nodeX + NODE_W + 4;
      const arrowY = TIMELINE_Y + NODE_H / 2;
      const arrowLen = GAP - 8;

      const arrow = makeArrow({
        id: randomUUID(),
        x: arrowX, y: arrowY,
        points: [[0, 0], [arrowLen, 0]],
        color: C.stroke,
      });
      bindArrow(arrow, node, nodeEls[i]); // will rebind endBinding after next node exists
      els.push(arrow);
    }
  }

  // ─── Repeat loop arrow (from last stage back to first) ───────
  // Curved path: goes down from last node, runs left along bottom, back up to first node
  const lastX = START_X + (STAGES.length - 1) * STEP + NODE_W / 2;
  const firstX = START_X + NODE_W / 2;
  const loopY = TIMELINE_Y + NODE_H + 70;

  // Down from last node
  const loopDown = makeArrow({
    id: randomUUID(),
    x: lastX, y: TIMELINE_Y + NODE_H + 4,
    points: [[0, 0], [0, 40]],
    color: C.orangeDk,
  });
  loopDown.strokeStyle = 'dashed';
  els.push(loopDown);

  // Horizontal run back (long dashed line)
  const loopHoriz = makeDashedArrow({
    id: randomUUID(),
    x: lastX, y: loopY,
    points: [[0, 0], [firstX - lastX, 0]],
    color: C.orangeDk,
  });
  els.push(loopHoriz);

  // Up to first node
  const loopUp = makeArrow({
    id: randomUUID(),
    x: firstX, y: loopY,
    points: [[0, 0], [0, -(loopY - TIMELINE_Y - NODE_H - 4)]],
    color: C.orangeDk,
  });
  loopUp.strokeStyle = 'dashed';
  els.push(loopUp);

  // Loop label
  els.push(makeText({
    id: randomUUID(),
    x: (firstX + lastX) / 2 - 80, y: loopY - 18,
    text: 'Loyal customer returns!',
    fontSize: FONT.small, color: C.orangeDk, textAlign: 'center', width: 160,
  }));

  // ─── Legend ──────────────────────────────────────────────────
  const legW = 660;
  const legH = 90;
  const legX = (CW - legW) / 2;
  const legY = loopY + 40;

  els.push(makeRect({
    id: randomUUID(), x: legX, y: legY, w: legW, h: legH,
    fillColor: C.legendBg, strokeColor: C.stroke, roundness: 10,
  }));
  els.push(makeText({
    id: randomUUID(), x: legX + 20, y: legY + 8,
    text: 'Journey Phases', fontSize: FONT.body, color: C.textDark,
  }));
  els.push(makeLine({
    id: randomUUID(), x: legX + 20, y: legY + 30,
    points: [[0, 0], [legW - 40, 0]], color: C.stroke, strokeStyle: 'solid',
  }));

  const swatchY = legY + 42;
  const swatchSize = 18;
  const legendItems = [
    { color: C.purple,  text: 'Awareness' },
    { color: C.blue,    text: 'Consideration' },
    { color: C.green,   text: 'Purchase' },
    { color: C.orange,  text: 'Post-Purchase' },
  ];
  for (let i = 0; i < legendItems.length; i++) {
    const sx = legX + 30 + i * 158;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: swatchY, w: swatchSize, h: swatchSize,
      fillColor: legendItems[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + swatchSize + 8, y: swatchY + 1,
      text: legendItems[i].text, fontSize: FONT.small, color: C.textDark,
    }));
  }

  // ─── Footer ──────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: legX, y: legY + legH + 12,
    text: 'ThreadPup \u00b7 Premium Dog Merchandise \u00b7 threadpup.com',
    fontSize: FONT.caption, color: C.textMuted,
    textAlign: 'center', width: legW,
  }));

  return els;
}

// ── Main ──────────────────────────────────────────────────────
const BASE_DIR = 'c:/Users/ADMIN/Desktop/Infographics';
const OUT_DIR = path.join(BASE_DIR, 'generated');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const elements = build();
  const doc = makeDocument(elements, C.bg);

  const excPath = path.resolve(OUT_DIR, 'threadpup-journey.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const cliPath = path.join(BASE_DIR, 'node_modules', '.bin', 'excalidraw-brute-export-cli');

  // PNG at 2x
  const pngPath = path.resolve(OUT_DIR, 'threadpup-journey.png');
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

  // SVG
  const svgPath = path.resolve(OUT_DIR, 'threadpup-journey.svg');
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
