import { randomUUID } from 'node:crypto';
import { makeRect, makeText, makeEllipse, makeArrow, wrapText, bindArrow } from '../excalidraw-helpers.js';
import { COLORS, SECTION_COLORS, FONT, CANVAS } from '../constants.js';

const CENTER_X = CANVAS.width / 2;
const CENTER_Y = 320;
const CENTER_W = 240;
const CENTER_H = 70;
const SAT_W = 220;
const SAT_PAD = 14;

// Two-tier layout: top row and bottom row, spread wide
// Each position is { x, y } offset from center — hand-tuned for portrait 800px canvas
const LAYOUT_CONFIGS = {
  2: [
    { x: -240, y: 220 },
    { x: 240, y: 220 },
  ],
  3: [
    { x: -260, y: 190 },
    { x: 0, y: 280 },
    { x: 260, y: 190 },
  ],
  4: [
    { x: -250, y: 180 },
    { x: 250, y: 180 },
    { x: -250, y: 400 },
    { x: 250, y: 400 },
  ],
  5: [
    { x: -260, y: 170 },
    { x: 260, y: 170 },
    { x: -260, y: 370 },
    { x: 0, y: 450 },
    { x: 260, y: 370 },
  ],
};

/**
 * Compute the point on an ellipse edge in a given direction (dx, dy) from its center.
 */
function ellipseEdge(cx, cy, halfW, halfH, dx, dy) {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x: cx, y: cy };
  const nx = dx / len;
  const ny = dy / len;
  // Parametric: point on ellipse in direction (nx, ny)
  const scale = 1 / Math.sqrt((nx * nx) / (halfW * halfW) + (ny * ny) / (halfH * halfH));
  return { x: cx + nx * scale, y: cy + ny * scale };
}

/**
 * Compute the point on a rectangle edge in a given direction (dx, dy) from its center.
 */
function rectEdge(cx, cy, halfW, halfH, dx, dy) {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x: cx, y: cy };
  const nx = dx / len;
  const ny = dy / len;
  // Find scale to reach the rectangle boundary
  const scaleX = halfW / Math.abs(nx || 0.001);
  const scaleY = halfH / Math.abs(ny || 0.001);
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + nx * scale, y: cy + ny * scale };
}

export function buildMindmap(sectionIndex, summary) {
  const elements = [];

  // --- Title at top ---
  const titleText = makeText({
    id: randomUUID(),
    x: (CANVAS.width - 600) / 2,
    y: CANVAS.topStart,
    text: summary.heading,
    fontSize: FONT.title,
    color: COLORS.textDark,
    textAlign: 'center',
    width: 600,
  });
  elements.push(titleText);

  // --- Subheading ---
  if (summary.subheading) {
    const sub = makeText({
      id: randomUUID(),
      x: (CANVAS.width - 600) / 2,
      y: CANVAS.topStart + 42,
      text: summary.subheading,
      fontSize: FONT.small,
      color: COLORS.textMuted,
      textAlign: 'center',
      width: 600,
    });
    elements.push(sub);
  }

  // --- Central node ---
  const centerId = randomUUID();
  const centerOval = makeEllipse({
    id: centerId,
    x: CENTER_X - CENTER_W / 2,
    y: CENTER_Y - CENTER_H / 2,
    w: CENTER_W,
    h: CENTER_H,
    fillColor: COLORS.warmPeach,
    strokeColor: COLORS.stroke,
  });
  elements.push(centerOval);

  const centerWrapped = wrapText(summary.heading, 180, FONT.heading);
  const centerLines = centerWrapped.split('\n').length;
  const centerTextH = centerLines * FONT.heading * FONT.lineHeight;
  const centerLabel = makeText({
    id: randomUUID(),
    x: CENTER_X - 90,
    y: CENTER_Y - centerTextH / 2,
    text: centerWrapped,
    fontSize: FONT.heading,
    color: COLORS.textDark,
    textAlign: 'center',
    width: 180,
  });
  elements.push(centerLabel);

  // --- Satellite nodes ---
  const bullets = summary.bullets || [];
  const stats = summary.stats || [];
  const count = Math.min(bullets.length, 5);
  const positions = LAYOUT_CONFIGS[count] || LAYOUT_CONFIGS[Math.min(count, 5)];

  let maxBottomY = CENTER_Y;

  for (let i = 0; i < count; i++) {
    const color = SECTION_COLORS[i % SECTION_COLORS.length];
    const pos = positions[i];
    const satCenterX = CENTER_X + pos.x;
    const satCenterY = CENTER_Y + pos.y;

    // Wrap text to fit inside satellite rectangle
    const wrapped = wrapText(bullets[i], SAT_W - SAT_PAD * 2, FONT.body);
    const lineCount = wrapped.split('\n').length;
    const satH = Math.max(50, lineCount * FONT.body * FONT.lineHeight + SAT_PAD * 2);

    // All rectangles with varying roundness for visual interest
    const roundnessValues = [10, 16, 22, 10, 16];
    const satId = randomUUID();
    const satShape = makeRect({
      id: satId,
      x: satCenterX - SAT_W / 2,
      y: satCenterY - satH / 2,
      w: SAT_W,
      h: satH,
      fillColor: color,
      roundness: roundnessValues[i % roundnessValues.length],
    });
    elements.push(satShape);

    // Satellite text — centered inside the rectangle
    const satText = makeText({
      id: randomUUID(),
      x: satCenterX - (SAT_W - SAT_PAD * 2) / 2,
      y: satCenterY - (lineCount * FONT.body * FONT.lineHeight) / 2,
      text: wrapped,
      fontSize: FONT.body,
      color: COLORS.textDark,
      textAlign: 'center',
      width: SAT_W - SAT_PAD * 2,
    });
    elements.push(satText);

    // --- Arrow from central ellipse edge to satellite rect edge ---
    const dx = satCenterX - CENTER_X;
    const dy = satCenterY - CENTER_Y;

    // Start: edge of central ellipse facing toward satellite
    const start = ellipseEdge(CENTER_X, CENTER_Y, CENTER_W / 2, CENTER_H / 2, dx, dy);
    // End: edge of satellite rectangle facing toward center
    const end = rectEdge(satCenterX, satCenterY, SAT_W / 2, satH / 2, -dx, -dy);

    // Add a small gap (8px) so arrow doesn't touch the shapes
    const arrowLen = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    if (arrowLen > 20) {
      const ux = (end.x - start.x) / arrowLen;
      const uy = (end.y - start.y) / arrowLen;
      const gap = 8;
      const arrowStartX = start.x + ux * gap;
      const arrowStartY = start.y + uy * gap;
      const arrowEndX = end.x - ux * gap;
      const arrowEndY = end.y - uy * gap;

      const arrow = makeArrow({
        id: randomUUID(),
        x: arrowStartX,
        y: arrowStartY,
        points: [[0, 0], [arrowEndX - arrowStartX, arrowEndY - arrowStartY]],
        color: COLORS.textMuted,
      });
      bindArrow(arrow, centerOval, satShape);
      elements.push(arrow);
    }

    // --- Stat badge below satellite ---
    if (i < stats.length && stats[i]) {
      const stat = stats[i];
      const statLabel = `${stat.value || stat}`;
      const statY = satCenterY + satH / 2 + 10;

      const statBg = makeRect({
        id: randomUUID(),
        x: satCenterX - 60,
        y: statY,
        w: 120,
        h: 28,
        fillColor: COLORS.white,
        strokeColor: color,
        roundness: 6,
        strokeStyle: 'dashed',
      });
      elements.push(statBg);

      const statTxt = makeText({
        id: randomUUID(),
        x: satCenterX - 55,
        y: statY + 5,
        text: statLabel,
        fontSize: FONT.small,
        color: COLORS.textDark,
        textAlign: 'center',
        width: 110,
      });
      elements.push(statTxt);

      maxBottomY = Math.max(maxBottomY, statY + 38);
    } else {
      maxBottomY = Math.max(maxBottomY, satCenterY + satH / 2 + 10);
    }
  }

  // --- Source footer ---
  const footerY = maxBottomY + 30;
  const footer = makeText({
    id: randomUUID(),
    x: (CANVAS.width - 400) / 2,
    y: footerY,
    text: 'Source: clockify.me/time-management-statistics',
    fontSize: FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    width: 400,
  });
  elements.push(footer);

  return elements;
}
