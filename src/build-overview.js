/**
 * ThreadPup Polished Overview – Unified summary combining
 * architecture highlights + journey highlights + CTA.
 *
 * Usage:  node src/build-overview.js
 */

import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  makeRect, makeText, makeArrow, makeLine, makeEllipse,
  makeDocument,
} from './excalidraw-helpers.js';
import { FONT } from './constants.js';

// ── ThreadPup brand palette ────────────────────────────────────
const TP = {
  bg:        '#FAFAF7',
  blue:      '#B8D4E8',
  green:     '#B8D9C4',
  orange:    '#F2C894',
  purple:    '#D4C5E8',
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  white:     '#ffffff',
  legendBg:  '#f5f3ef',
};

// ── Layout ─────────────────────────────────────────────────────
const CW = 520;
const PAD = 20;

function build() {
  const els = [];
  let Y = 24;

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'ThreadPup',
    fontSize: 32, color: TP.textDark, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 44;

  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'The Complete Dog Merch Platform',
    fontSize: FONT.heading, color: TP.textMuted, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 36;

  // ─── Divider ─────────────────────────────────────────────────
  els.push(makeLine({
    id: randomUUID(), x: CW / 2 - 60, y: Y,
    points: [[0, 0], [120, 0]], color: TP.orange, strokeStyle: 'solid',
  }));
  Y += 16;

  // ─── Tech Stack Row ──────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'TECH STACK', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 22;

  const techItems = ['Next.js', 'Supabase', 'Stripe', 'Resend', 'Vercel'];
  const chipW = 80;
  const chipH = 28;
  const chipGap = 10;
  const totalChipW = techItems.length * chipW + (techItems.length - 1) * chipGap;
  const chipStartX = (CW - totalChipW) / 2;
  const chipColors = [TP.blue, TP.green, TP.orange, TP.orange, TP.blue];

  for (let i = 0; i < techItems.length; i++) {
    const cx = chipStartX + i * (chipW + chipGap);
    els.push(makeRect({
      id: randomUUID(), x: cx, y: Y, w: chipW, h: chipH,
      fillColor: chipColors[i], roundness: 14,
    }));
    els.push(makeText({
      id: randomUUID(), x: cx + 4, y: Y + 6,
      text: techItems[i], fontSize: FONT.small,
      color: TP.textDark, textAlign: 'center', width: chipW - 8,
    }));
  }
  Y += chipH + 20;

  // ─── Architecture Summary (compact horizontal flow) ──────────
  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'SYSTEM FLOW', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 20;

  const flowItems = [
    { label: 'Customer', color: TP.blue },
    { label: 'Storefront', color: TP.blue },
    { label: 'Payment', color: TP.orange },
    { label: 'Fulfillment', color: TP.green },
    { label: 'Delivery', color: TP.green },
  ];
  const fBoxW = 78;
  const fBoxH = 40;
  const fGap = 12;
  const fTotalW = flowItems.length * fBoxW + (flowItems.length - 1) * fGap;
  const fStartX = (CW - fTotalW) / 2;

  for (let i = 0; i < flowItems.length; i++) {
    const fx = fStartX + i * (fBoxW + fGap);
    els.push(makeRect({
      id: randomUUID(), x: fx, y: Y, w: fBoxW, h: fBoxH,
      fillColor: flowItems[i].color, roundness: 8,
    }));
    els.push(makeText({
      id: randomUUID(), x: fx + 4, y: Y + 11,
      text: flowItems[i].label, fontSize: FONT.small,
      color: TP.textDark, textAlign: 'center', width: fBoxW - 8,
    }));

    // Arrow
    if (i < flowItems.length - 1) {
      els.push(makeArrow({
        id: randomUUID(),
        x: fx + fBoxW + 2, y: Y + fBoxH / 2,
        points: [[0, 0], [fGap - 4, 0]],
        color: TP.stroke,
      }));
    }
  }
  Y += fBoxH + 24;

  // ─── Journey Summary (numbered milestones) ───────────────────
  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'CUSTOMER JOURNEY', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 22;

  const milestones = [
    { num: '1', label: 'Discover', color: TP.purple },
    { num: '2', label: 'Browse', color: TP.blue },
    { num: '3', label: 'Purchase', color: TP.green },
    { num: '4', label: 'Fulfill', color: TP.orange },
    { num: '5', label: 'Deliver', color: TP.orange },
    { num: '6', label: 'Repeat', color: TP.purple },
  ];
  const mSize = 44;
  const mGap = 14;
  const mTotalW = milestones.length * mSize + (milestones.length - 1) * mGap;
  const mStartX = (CW - mTotalW) / 2;

  // Connecting line
  els.push(makeLine({
    id: randomUUID(),
    x: mStartX + mSize / 2, y: Y + mSize / 2,
    points: [[0, 0], [mTotalW - mSize, 0]],
    color: TP.stroke, strokeStyle: 'solid',
  }));

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const mx = mStartX + i * (mSize + mGap);

    // Circle
    els.push(makeEllipse({
      id: randomUUID(), x: mx, y: Y,
      w: mSize, h: mSize,
      fillColor: m.color, strokeColor: m.color,
    }));
    // Number
    els.push(makeText({
      id: randomUUID(), x: mx + 6, y: Y + 8,
      text: m.num, fontSize: FONT.heading,
      color: TP.white, textAlign: 'center', width: mSize - 12,
    }));
    // Label below
    els.push(makeText({
      id: randomUUID(), x: mx - 6, y: Y + mSize + 4,
      text: m.label, fontSize: FONT.caption,
      color: TP.textDark, textAlign: 'center', width: mSize + 12,
    }));
  }
  Y += mSize + 30;

  // ─── Key Stats / Highlights ──────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'HIGHLIGHTS', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 22;

  const highlights = [
    { icon: '6', label: 'Services', desc: 'Integrated', color: TP.blue },
    { icon: '12', label: 'Journey', desc: 'Stages', color: TP.green },
    { icon: '3', label: 'Emails', desc: 'Automated', color: TP.orange },
  ];
  const hW = 140;
  const hGap = 16;
  const hTotalW = highlights.length * hW + (highlights.length - 1) * hGap;
  const hStartX = (CW - hTotalW) / 2;

  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    const hx = hStartX + i * (hW + hGap);

    els.push(makeRect({
      id: randomUUID(), x: hx, y: Y, w: hW, h: 62,
      fillColor: h.color, roundness: 10,
    }));
    // Big number
    els.push(makeText({
      id: randomUUID(), x: hx + 8, y: Y + 6,
      text: h.icon, fontSize: 28,
      color: TP.textDark, textAlign: 'center', width: hW - 16,
    }));
    // Label
    els.push(makeText({
      id: randomUUID(), x: hx + 8, y: Y + 38,
      text: `${h.desc} ${h.label}`, fontSize: FONT.caption,
      color: TP.textDark, textAlign: 'center', width: hW - 16,
    }));
  }
  Y += 80;

  // ─── CTA Section ────────────────────────────────────────────
  els.push(makeLine({
    id: randomUUID(), x: CW / 2 - 60, y: Y,
    points: [[0, 0], [120, 0]], color: TP.orange, strokeStyle: 'solid',
  }));
  Y += 16;

  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'Follow for more tech breakdowns',
    fontSize: FONT.heading, color: TP.textDark,
    textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 30;

  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'Built with Next.js · Supabase · Stripe · Resend',
    fontSize: FONT.small, color: TP.textMuted,
    textAlign: 'center', width: CW - PAD * 2,
  }));
  Y += 20;

  els.push(makeText({
    id: randomUUID(), x: PAD, y: Y,
    text: 'threadpup.com',
    fontSize: FONT.body, color: TP.textDark,
    textAlign: 'center', width: CW - PAD * 2,
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

  const excPath = path.resolve(OUT_DIR, 'threadpup-overview.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const pngPath = path.resolve(OUT_DIR, 'threadpup-overview.png');
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
