/**
 * ThreadPup System Architecture – Excalidraw diagram builder.
 *
 * Generates an .excalidraw file + PNG (2x) + optional SVG.
 *
 * Usage:  node src/build-architecture.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeEllipse, makeArrow, makeLine,
  wrapText, bindArrow, bindTextToContainer, makeDocument,
} from './excalidraw-helpers.js';
import { FONT, ELEMENT } from './constants.js';

// ── ThreadPup brand palette ────────────────────────────────────
const TP = {
  bg:         '#FAFAF7',   // off-white cream
  blue:       '#B8D4E8',   // customer-facing
  green:      '#B8D9C4',   // backend services
  orange:     '#F2C894',   // third-party APIs
  stroke:     '#4a4a4a',
  textDark:   '#2d2d2d',
  textMuted:  '#6b6b6b',
  white:      '#ffffff',
  legendBg:   '#f5f3ef',
};

// ── Canvas & layout constants ──────────────────────────────────
const CW = 1140;           // canvas width (wider for sidebar breathing room)
const MAIN_CX = 420;       // center-x of main flow column
const SIDE_CX = 960;       // center-x of Resend sidebar
const PAD = 20;             // inner padding for boxes
const ARROW_LEN = 50;      // vertical arrow length

// ── Helper: dashed arrow (makeArrow doesn't expose strokeStyle) ─
function makeDashedArrow(opts) {
  const a = makeArrow(opts);
  a.strokeStyle = 'dashed';
  return a;
}

// ── Build all elements ─────────────────────────────────────────
function build() {
  const els = [];
  let Y = 40;

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: (CW - 700) / 2, y: Y,
    text: 'ThreadPup System Architecture',
    fontSize: 32, color: TP.textDark, textAlign: 'center', width: 700,
  }));
  Y += 48;

  els.push(makeText({
    id: randomUUID(), x: (CW - 700) / 2, y: Y,
    text: 'How a Dog Merch Order Gets Made',
    fontSize: FONT.small, color: TP.textMuted, textAlign: 'center', width: 700,
  }));
  Y += 28;

  // ─── Tech Stack Row ─────────────────────────────────────────
  const techItems = ['Next.js', 'Supabase', 'Stripe', 'Resend', 'Vercel'];
  const techPillW = 90, techPillH = 26, techGap = 12;
  const totalTechW = techItems.length * techPillW + (techItems.length - 1) * techGap;
  const techStartX = (CW - totalTechW) / 2;
  for (let i = 0; i < techItems.length; i++) {
    const px = techStartX + i * (techPillW + techGap);
    els.push(makeRect({
      id: randomUUID(), x: px, y: Y, w: techPillW, h: techPillH,
      fillColor: TP.legendBg, strokeColor: TP.stroke, roundness: 13,
      strokeStyle: 'dashed',
    }));
    els.push(makeText({
      id: randomUUID(), x: px + 4, y: Y + 5,
      text: techItems[i], fontSize: FONT.small,
      color: TP.textMuted, textAlign: 'center', width: techPillW - 8,
    }));
  }
  Y += techPillH + 16;

  // ─── 1. Customer Browser (blue) ─────────────────────────────
  const custW = 320, custH = 70;
  const custX = MAIN_CX - custW / 2;
  const custId = randomUUID();
  const custBox = makeRect({
    id: custId, x: custX, y: Y, w: custW, h: custH,
    fillColor: TP.blue, roundness: 12,
  });
  els.push(custBox);

  els.push(makeText({
    id: randomUUID(), x: custX + PAD, y: Y + 10,
    text: 'Customer Browser', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: custW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: custX + PAD, y: Y + 42,
    text: 'visits threadpup.com', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: custW - PAD * 2,
  }));

  // Annotation bubble
  els.push(makeRect({
    id: randomUUID(), x: custX + custW + 20, y: Y + 12,
    w: 100, h: 32, fillColor: TP.white, strokeColor: TP.blue,
    roundness: 8, strokeStyle: 'dashed',
  }));
  els.push(makeText({
    id: randomUUID(), x: custX + custW + 28, y: Y + 18,
    text: 'HTTPS', fontSize: FONT.small, color: TP.textMuted,
    textAlign: 'center', width: 84,
  }));

  const custBottomY = Y + custH;
  Y = custBottomY;

  // ─── Arrow: Customer → Storefront ───────────────────────────
  const a1 = makeArrow({
    id: randomUUID(), x: MAIN_CX, y: Y + 4,
    points: [[0, 0], [0, ARROW_LEN]], color: TP.stroke,
  });
  els.push(a1);
  // Label
  els.push(makeText({
    id: randomUUID(), x: MAIN_CX + 8, y: Y + 14,
    text: 'HTTPS Request', fontSize: FONT.caption, color: TP.textMuted,
  }));
  Y += ARROW_LEN + 8;

  // ─── 2. Next.js Storefront (blue) ──────────────────────────
  const sfW = 380, sfH = 80;
  const sfX = MAIN_CX - sfW / 2;
  const sfId = randomUUID();
  const sfBox = makeRect({
    id: sfId, x: sfX, y: Y, w: sfW, h: sfH,
    fillColor: TP.blue, roundness: 12,
  });
  els.push(sfBox);

  bindArrow(a1, custBox, sfBox);

  els.push(makeText({
    id: randomUUID(), x: sfX + PAD, y: Y + 12,
    text: 'Next.js Storefront', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: sfW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: sfX + PAD, y: Y + 44,
    text: 'hosted on Vercel', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: sfW - PAD * 2,
  }));

  const sfBottomY = Y + sfH;
  const sfCenterY = Y + sfH / 2;

  // ─── Split arrows: Storefront → Supabase / Stripe ──────────
  // Supabase position — wider gap from center for breathing room
  const supW = 240, supH = 80;
  const supX = MAIN_CX - 310;  // further left
  const supY = sfBottomY + 110; // more vertical space for labels
  const supCX = supX + supW / 2;
  const supCY = supY + supH / 2;

  // Stripe position
  const strW = 240, strH = 80;
  const strX = MAIN_CX + 70;   // further right
  const strY = sfBottomY + 110;
  const strCX = strX + strW / 2;
  const strCY = strY + strH / 2;

  // Arrow: Storefront → Supabase (left-down)
  const aSup = makeArrow({
    id: randomUUID(),
    x: sfX + 60,
    y: sfBottomY + 4,
    points: [[0, 0], [supCX - (sfX + 60), supY - sfBottomY - 8]],
    color: TP.stroke,
  });

  // Arrow: Storefront → Stripe (right-down)
  const aStr = makeArrow({
    id: randomUUID(),
    x: sfX + sfW - 60,
    y: sfBottomY + 4,
    points: [[0, 0], [strCX - (sfX + sfW - 60), strY - sfBottomY - 8]],
    color: TP.stroke,
  });

  // Labels on split arrows — positioned further out to avoid overlap
  els.push(makeText({
    id: randomUUID(),
    x: sfX - 90, y: sfBottomY + 36,
    text: 'fetch products\n+ auth',
    fontSize: FONT.small, color: TP.textMuted,
  }));
  els.push(makeText({
    id: randomUUID(),
    x: sfX + sfW + 16, y: sfBottomY + 36,
    text: 'submit order\n+ payment',
    fontSize: FONT.small, color: TP.textMuted,
  }));

  // ─── 3a. Supabase (orange) ─────────────────────────────────
  const supId = randomUUID();
  const supBox = makeRect({
    id: supId, x: supX, y: supY, w: supW, h: supH,
    fillColor: TP.orange, roundness: 12,
  });
  bindArrow(aSup, sfBox, supBox);
  els.push(aSup);
  els.push(supBox);

  els.push(makeText({
    id: randomUUID(), x: supX + PAD, y: supY + 12,
    text: 'Supabase', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: supW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: supX + PAD, y: supY + 44,
    text: 'Database + Auth', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: supW - PAD * 2,
  }));

  // Dashed return arrow: Supabase → Storefront (up from top-right of Supabase)
  const retStartX = supX + supW - 40;
  const retStartY = supY - 4;
  const retEndX = sfX + 50;
  const retEndY = sfBottomY + 4;
  const retArrow = makeDashedArrow({
    id: randomUUID(),
    x: retStartX,
    y: retStartY,
    points: [[0, 0], [retEndX - retStartX, retEndY - retStartY]],
    color: TP.textMuted,
  });
  retArrow.endArrowhead = 'arrow';
  retArrow.startArrowhead = null;
  els.push(retArrow);
  // Label to the left of return arrow
  els.push(makeText({
    id: randomUUID(),
    x: supX - 10, y: supY - 28,
    text: 'product data + session',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // ─── 3b. Stripe (orange) ───────────────────────────────────
  const strId = randomUUID();
  const strBox = makeRect({
    id: strId, x: strX, y: strY, w: strW, h: strH,
    fillColor: TP.orange, roundness: 12,
  });
  bindArrow(aStr, sfBox, strBox);
  els.push(aStr);
  els.push(strBox);

  els.push(makeText({
    id: randomUUID(), x: strX + PAD, y: strY + 12,
    text: 'Stripe', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: strW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: strX + PAD, y: strY + 44,
    text: 'Payment Processing', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: strW - PAD * 2,
  }));

  // ─── Arrow: Stripe → Fulfillment API ───────────────────────
  const fulW = 320, fulH = 70;
  const fulX = MAIN_CX - fulW / 2;
  const fulY = strY + strH + 80;
  const fulCX = fulX + fulW / 2;

  const aFul = makeArrow({
    id: randomUUID(),
    x: strCX,
    y: strY + strH + 4,
    points: [[0, 0], [fulCX - strCX, fulY - strY - strH - 8]],
    color: TP.stroke,
  });
  els.push(makeText({
    id: randomUUID(),
    x: strCX + 8, y: strY + strH + 20,
    text: 'payment\nconfirmed',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // ─── 4. Fulfillment API (green) ────────────────────────────
  const fulId = randomUUID();
  const fulBox = makeRect({
    id: fulId, x: fulX, y: fulY, w: fulW, h: fulH,
    fillColor: TP.green, roundness: 12,
  });
  bindArrow(aFul, strBox, fulBox);
  els.push(aFul);
  els.push(fulBox);

  els.push(makeText({
    id: randomUUID(), x: fulX + PAD, y: fulY + 12,
    text: 'Fulfillment API', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: fulW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: fulX + PAD, y: fulY + 42,
    text: 'triggered on payment success', fontSize: FONT.caption,
    color: TP.textMuted, textAlign: 'center', width: fulW - PAD * 2,
  }));

  // ─── Arrow: Fulfillment → Print Shop ───────────────────────
  const psW = 320, psH = 80;
  const psX = MAIN_CX - psW / 2;
  const psY = fulY + fulH + 60;

  const aPS = makeArrow({
    id: randomUUID(),
    x: MAIN_CX, y: fulY + fulH + 4,
    points: [[0, 0], [0, psY - fulY - fulH - 8]],
    color: TP.stroke,
  });
  els.push(makeText({
    id: randomUUID(),
    x: MAIN_CX + 8, y: fulY + fulH + 16,
    text: 'send print job',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // ─── 5. Print Shop (green) ─────────────────────────────────
  const psId = randomUUID();
  const psBox = makeRect({
    id: psId, x: psX, y: psY, w: psW, h: psH,
    fillColor: TP.green, roundness: 12,
  });
  bindArrow(aPS, fulBox, psBox);
  els.push(aPS);
  els.push(psBox);

  els.push(makeText({
    id: randomUUID(), x: psX + PAD, y: psY + 10,
    text: 'Print Shop', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: psW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: psX + PAD, y: psY + 40,
    text: 'Production & Shipping', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: psW - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: psX + psW + 16, y: psY + 24,
    text: 'prints & ships\ndog merch',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // ── Resend Email Sidebar ────────────────────────────────────
  const sideW = 160;
  const sideX = SIDE_CX - sideW / 2;
  const emailH = 52;

  // Sidebar header
  els.push(makeText({
    id: randomUUID(), x: sideX, y: strY - 40,
    text: 'Resend', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: sideW,
  }));
  els.push(makeText({
    id: randomUUID(), x: sideX, y: strY - 16,
    text: 'Email Notifications', fontSize: FONT.caption,
    color: TP.textMuted, textAlign: 'center', width: sideW,
  }));

  // Email box 1: Order Confirmation
  const e1Y = strY + 10;
  const e1Id = randomUUID();
  const e1Box = makeRect({
    id: e1Id, x: sideX, y: e1Y, w: sideW, h: emailH,
    fillColor: TP.orange, roundness: 10,
  });
  els.push(e1Box);
  els.push(makeText({
    id: randomUUID(), x: sideX + 10, y: e1Y + 8,
    text: 'Order\nConfirmation', fontSize: FONT.body,
    color: TP.textDark, textAlign: 'center', width: sideW - 20,
  }));

  // Dashed arrow from Stripe → Email 1
  const de1 = makeDashedArrow({
    id: randomUUID(),
    x: strX + strW + 4, y: strCY,
    points: [[0, 0], [sideX - strX - strW - 8, e1Y + emailH / 2 - strCY]],
    color: TP.textMuted,
  });
  els.push(de1);
  els.push(makeText({
    id: randomUUID(),
    x: strX + strW + 12, y: strCY - 18,
    text: 'on order placed',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // Email box 2: Shipping Notification
  const e2Y = e1Y + emailH + 40;
  const e2Id = randomUUID();
  const e2Box = makeRect({
    id: e2Id, x: sideX, y: e2Y, w: sideW, h: emailH,
    fillColor: TP.orange, roundness: 10,
  });
  els.push(e2Box);
  els.push(makeText({
    id: randomUUID(), x: sideX + 10, y: e2Y + 8,
    text: 'Shipping\nNotification', fontSize: FONT.body,
    color: TP.textDark, textAlign: 'center', width: sideW - 20,
  }));

  // Dashed arrow down between email boxes
  const de12 = makeDashedArrow({
    id: randomUUID(),
    x: SIDE_CX, y: e1Y + emailH + 4,
    points: [[0, 0], [0, 32]], color: TP.textMuted,
  });
  els.push(de12);

  // Dashed arrow from Fulfillment → Email 2
  const de2 = makeDashedArrow({
    id: randomUUID(),
    x: fulX + fulW + 4, y: fulY + fulH / 2,
    points: [[0, 0], [sideX - fulX - fulW - 8, e2Y + emailH / 2 - fulY - fulH / 2]],
    color: TP.textMuted,
  });
  els.push(de2);
  els.push(makeText({
    id: randomUUID(),
    x: fulX + fulW + 12, y: fulY + fulH / 2 - 8,
    text: 'on fulfillment',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // Email box 3: Delivery Update
  const e3Y = e2Y + emailH + 40;
  const e3Id = randomUUID();
  const e3Box = makeRect({
    id: e3Id, x: sideX, y: e3Y, w: sideW, h: emailH,
    fillColor: TP.orange, roundness: 10,
  });
  els.push(e3Box);
  els.push(makeText({
    id: randomUUID(), x: sideX + 10, y: e3Y + 8,
    text: 'Delivery\nUpdate', fontSize: FONT.body,
    color: TP.textDark, textAlign: 'center', width: sideW - 20,
  }));

  // Dashed arrow down between email boxes 2→3
  const de23 = makeDashedArrow({
    id: randomUUID(),
    x: SIDE_CX, y: e2Y + emailH + 4,
    points: [[0, 0], [0, 32]], color: TP.textMuted,
  });
  els.push(de23);

  // Dashed arrow from Print Shop → Email 3
  const de3 = makeDashedArrow({
    id: randomUUID(),
    x: psX + psW + 4, y: psY + psH / 2,
    points: [[0, 0], [sideX - psX - psW - 8, e3Y + emailH / 2 - psY - psH / 2]],
    color: TP.textMuted,
  });
  els.push(de3);
  els.push(makeText({
    id: randomUUID(),
    x: psX + psW + 12, y: psY + psH / 2 - 8,
    text: 'on shipped',
    fontSize: FONT.caption, color: TP.textMuted,
  }));

  // ── Legend ───────────────────────────────────────────────────
  const legY = Math.max(psY + psH, e3Y + emailH) + 50;
  const legW = 500, legH = 100;
  const legX = (CW - legW) / 2;

  els.push(makeRect({
    id: randomUUID(), x: legX, y: legY, w: legW, h: legH,
    fillColor: TP.legendBg, strokeColor: TP.stroke, roundness: 10,
  }));
  els.push(makeText({
    id: randomUUID(), x: legX + 20, y: legY + 8,
    text: 'Legend', fontSize: FONT.body, color: TP.textDark,
  }));
  // Divider line under "Legend"
  els.push(makeLine({
    id: randomUUID(), x: legX + 20, y: legY + 30,
    points: [[0, 0], [legW - 40, 0]], color: TP.stroke, strokeStyle: 'solid',
  }));

  // Color swatches
  const swatchY = legY + 40;
  const swatchSize = 18;
  const labels = [
    { color: TP.blue, text: 'Customer-Facing' },
    { color: TP.green, text: 'Backend Services' },
    { color: TP.orange, text: 'Third-Party APIs' },
  ];
  for (let i = 0; i < labels.length; i++) {
    const sx = legX + 30 + i * 160;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: swatchY, w: swatchSize, h: swatchSize,
      fillColor: labels[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + swatchSize + 8, y: swatchY + 1,
      text: labels[i].text, fontSize: FONT.small, color: TP.textDark,
    }));
  }

  // ── Footer ──────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: legX, y: legY + legH + 12,
    text: 'Built with Next.js \u00b7 Supabase \u00b7 Stripe \u00b7 Resend',
    fontSize: FONT.caption, color: TP.textMuted,
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
  const doc = makeDocument(elements, TP.bg);

  // Write .excalidraw
  const excPath = path.resolve(OUT_DIR, 'threadpup-architecture.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  // Export PNG at 2x
  const pngPath = path.resolve(OUT_DIR, 'threadpup-architecture-excalidraw.png');
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

  // Export SVG
  const svgPath = path.resolve(OUT_DIR, 'threadpup-architecture.svg');
  console.log('Exporting SVG...');
  const svgResult = spawnSync(
    cliPath,
    ['-i', excPath, '-o', svgPath, '--background', '1', '--embed-scene', '0', '--dark-mode', '0', '--scale', '2', '--format', 'svg'],
    { cwd: BASE_DIR, encoding: 'utf-8', timeout: 90000, shell: true, env: { ...process.env } },
  );
  if (svgResult.status !== 0) {
    console.error('SVG export FAILED:', svgResult.stderr?.slice(0, 500));
    // Non-fatal — PNG is the primary output
  } else {
    console.log(`Exported SVG: ${svgPath}`);
  }

  console.log('\nDone! Files:');
  console.log(`  Excalidraw: ${excPath}`);
  console.log(`  PNG (2x):   ${pngPath}`);
  if (svgResult.status === 0) console.log(`  SVG:        ${svgPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
