/**
 * ThreadPup Deployment Pipeline – GitHub → Vercel CI/CD flow.
 *
 * Usage:  node src/build-deployment.js
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
  blue:      '#B8D4E8',   // developer / customer-facing
  green:     '#B8D9C4',   // CI/CD / infrastructure
  orange:    '#F2C894',   // external services
  lavender:  '#D4C5E8',   // branch sidebar
  stroke:    '#4a4a4a',
  textDark:  '#2d2d2d',
  textMuted: '#6b6b6b',
  white:     '#ffffff',
  legendBg:  '#f5f3ef',
};

// ── Layout constants ───────────────────────────────────────────
const CW       = 700;
const MAIN_CX  = 300;
const BOX_W    = 300;
const SMALL_W  = 240;
const BOX_H    = 70;
const SMALL_H  = 42;
const ARROW_H  = 50;
const PAD      = 16;

function makeDashedArrow(opts) {
  const a = makeArrow(opts);
  a.strokeStyle = 'dashed';
  return a;
}

// ── Build all elements ─────────────────────────────────────────
function build() {
  const els = [];
  let Y = 30;

  // ─── Title ───────────────────────────────────────────────────
  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'ThreadPup Deployment Pipeline',
    fontSize: 30, color: TP.textDark, textAlign: 'center', width: CW - 40,
  }));
  Y += 40;

  els.push(makeText({
    id: randomUUID(), x: 20, y: Y,
    text: 'From Git Push to Production',
    fontSize: FONT.small, color: TP.textMuted, textAlign: 'center', width: CW - 40,
  }));
  Y += 32;

  // ─── 1. Developer (blue) ────────────────────────────────────
  const devX = MAIN_CX - BOX_W / 2;
  const devId = randomUUID();
  const devBox = makeRect({
    id: devId, x: devX, y: Y, w: BOX_W, h: BOX_H,
    fillColor: TP.blue, roundness: 12,
  });
  els.push(devBox);
  els.push(makeText({
    id: randomUUID(), x: devX + PAD, y: Y + 12,
    text: 'Developer', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: devX + PAD, y: Y + 40,
    text: 'writes code locally', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  Y += BOX_H;

  // Arrow: Dev → GitHub
  const a1 = makeArrow({
    id: randomUUID(), x: MAIN_CX, y: Y + 4,
    points: [[0, 0], [0, ARROW_H - 8]], color: TP.stroke,
  });
  els.push(a1);
  els.push(makeText({
    id: randomUUID(), x: MAIN_CX + 10, y: Y + 12,
    text: 'git push', fontSize: FONT.caption, color: TP.textMuted,
  }));
  Y += ARROW_H;

  // ─── 2. GitHub Repository (blue) ────────────────────────────
  const ghX = MAIN_CX - BOX_W / 2;
  const ghId = randomUUID();
  const ghBox = makeRect({
    id: ghId, x: ghX, y: Y, w: BOX_W, h: BOX_H,
    fillColor: TP.blue, roundness: 12,
  });
  bindArrow(a1, devBox, ghBox);
  els.push(ghBox);
  els.push(makeText({
    id: randomUUID(), x: ghX + PAD, y: Y + 12,
    text: 'GitHub Repository', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: ghX + PAD, y: Y + 40,
    text: 'source of truth', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  Y += BOX_H;

  // Arrow: GitHub → Build Pipeline
  const a2 = makeArrow({
    id: randomUUID(), x: MAIN_CX, y: Y + 4,
    points: [[0, 0], [0, ARROW_H - 8]], color: TP.stroke,
  });
  els.push(a2);
  els.push(makeText({
    id: randomUUID(), x: MAIN_CX + 10, y: Y + 12,
    text: 'webhook trigger', fontSize: FONT.caption, color: TP.textMuted,
  }));
  Y += ARROW_H;

  // ─── 3. Vercel Build Pipeline (green, tall container) ───────
  const pipeH = 4 * SMALL_H + 3 * 14 + 40; // 4 steps + gaps + padding
  const pipeX = MAIN_CX - BOX_W / 2;
  const pipeId = randomUUID();
  const pipeBox = makeRect({
    id: pipeId, x: pipeX, y: Y, w: BOX_W, h: pipeH,
    fillColor: TP.green, roundness: 12, strokeStyle: 'solid',
  });
  bindArrow(a2, ghBox, pipeBox);
  els.push(pipeBox);

  els.push(makeText({
    id: randomUUID(), x: pipeX + PAD, y: Y + 10,
    text: 'Vercel Build Pipeline', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
  }));

  // Build steps inside the pipeline
  const steps = [
    'Install Dependencies',
    'Run Linting & Type Check',
    'Run Tests',
    'Build Next.js App',
  ];
  let stepY = Y + 40;
  for (let i = 0; i < steps.length; i++) {
    const sx = pipeX + (BOX_W - SMALL_W) / 2;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: stepY, w: SMALL_W, h: SMALL_H,
      fillColor: TP.white, roundness: 8,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + 8, y: stepY + 10,
      text: `${i + 1}. ${steps[i]}`, fontSize: FONT.body,
      color: TP.textDark, textAlign: 'center', width: SMALL_W - 16,
    }));
    stepY += SMALL_H + 14;
  }

  Y += pipeH;

  // Arrow: Pipeline → Edge Network
  const a3 = makeArrow({
    id: randomUUID(), x: MAIN_CX, y: Y + 4,
    points: [[0, 0], [0, ARROW_H - 8]], color: TP.stroke,
  });
  els.push(a3);
  els.push(makeText({
    id: randomUUID(), x: MAIN_CX + 10, y: Y + 12,
    text: 'deploy', fontSize: FONT.caption, color: TP.textMuted,
  }));
  Y += ARROW_H;

  // ─── 4. Vercel Edge Network (green) ─────────────────────────
  const edgeX = MAIN_CX - BOX_W / 2;
  const edgeId = randomUUID();
  const edgeBox = makeRect({
    id: edgeId, x: edgeX, y: Y, w: BOX_W, h: BOX_H,
    fillColor: TP.green, roundness: 12,
  });
  bindArrow(a3, pipeBox, edgeBox);
  els.push(edgeBox);
  els.push(makeText({
    id: randomUUID(), x: edgeX + PAD, y: Y + 12,
    text: 'Vercel Edge Network', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: edgeX + PAD, y: Y + 40,
    text: 'CDN + serverless functions', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  Y += BOX_H;

  // Arrow: Edge → Production
  const a4 = makeArrow({
    id: randomUUID(), x: MAIN_CX, y: Y + 4,
    points: [[0, 0], [0, ARROW_H - 8]], color: TP.stroke,
  });
  els.push(a4);
  els.push(makeText({
    id: randomUUID(), x: MAIN_CX + 10, y: Y + 12,
    text: 'serves', fontSize: FONT.caption, color: TP.textMuted,
  }));
  Y += ARROW_H;

  // ─── 5. Production Site (blue) ──────────────────────────────
  const prodX = MAIN_CX - BOX_W / 2;
  const prodId = randomUUID();
  const prodBox = makeRect({
    id: prodId, x: prodX, y: Y, w: BOX_W, h: BOX_H,
    fillColor: TP.blue, roundness: 12,
  });
  bindArrow(a4, edgeBox, prodBox);
  els.push(prodBox);
  els.push(makeText({
    id: randomUUID(), x: prodX + PAD, y: Y + 12,
    text: 'Production Site', fontSize: FONT.heading,
    color: TP.textDark, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  els.push(makeText({
    id: randomUUID(), x: prodX + PAD, y: Y + 40,
    text: 'threadpup.com', fontSize: FONT.small,
    color: TP.textMuted, textAlign: 'center', width: BOX_W - PAD * 2,
  }));
  Y += BOX_H;

  // ── Branch Environments Sidebar (lavender) ──────────────────
  const sideW = 200;
  const sideX = MAIN_CX + BOX_W / 2 + 50;
  const sideY = 182; // align with GitHub box roughly

  els.push(makeText({
    id: randomUUID(), x: sideX, y: sideY,
    text: 'Branch Environments', fontSize: FONT.body,
    color: TP.textDark, textAlign: 'center', width: sideW,
  }));

  const branches = [
    { branch: 'main', env: 'Production', color: TP.green },
    { branch: 'staging', env: 'Preview', color: TP.orange },
    { branch: 'feature/*', env: 'Preview (auto)', color: TP.lavender },
  ];
  let bY = sideY + 28;
  for (const b of branches) {
    els.push(makeRect({
      id: randomUUID(), x: sideX, y: bY, w: sideW, h: 44,
      fillColor: b.color, roundness: 8,
    }));
    els.push(makeText({
      id: randomUUID(), x: sideX + 8, y: bY + 4,
      text: b.branch, fontSize: FONT.body,
      color: TP.textDark, textAlign: 'center', width: sideW - 16,
    }));
    els.push(makeText({
      id: randomUUID(), x: sideX + 8, y: bY + 24,
      text: `→ ${b.env}`, fontSize: FONT.small,
      color: TP.textMuted, textAlign: 'center', width: sideW - 16,
    }));
    bY += 56;
  }

  // Dashed arrow from GitHub → sidebar
  const daSide = makeDashedArrow({
    id: randomUUID(),
    x: MAIN_CX + BOX_W / 2 + 4, y: 222,
    points: [[0, 0], [42, 0]], color: TP.textMuted,
  });
  els.push(daSide);

  // ── Legend ───────────────────────────────────────────────────
  const legY = Y + 30;
  const legW = 460, legH = 90;
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
    { color: TP.blue,    text: 'Developer / App' },
    { color: TP.green,   text: 'CI/CD / Infra' },
    { color: TP.lavender, text: 'Branch Env' },
  ];
  for (let i = 0; i < swatches.length; i++) {
    const sx = legX + 24 + i * 148;
    els.push(makeRect({
      id: randomUUID(), x: sx, y: legY + 40, w: 16, h: 16,
      fillColor: swatches[i].color, roundness: 3,
    }));
    els.push(makeText({
      id: randomUUID(), x: sx + 22, y: legY + 41,
      text: swatches[i].text, fontSize: FONT.small, color: TP.textDark,
    }));
  }

  // Footer
  els.push(makeText({
    id: randomUUID(), x: legX, y: legY + legH + 10,
    text: 'Automated via Vercel Git Integration',
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

  const excPath = path.resolve(OUT_DIR, 'threadpup-deployment.excalidraw');
  await writeFile(excPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`Written: ${excPath}`);

  const cliPath = path.join(BASE_DIR, 'node_modules', '.bin', 'excalidraw-brute-export-cli');

  // Export PNG
  console.log('Exporting PNG (2x scale)...');
  const pngPath = path.resolve(OUT_DIR, 'threadpup-deployment.png');
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
  const svgPath = path.resolve(OUT_DIR, 'threadpup-deployment.svg');
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
