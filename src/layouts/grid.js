import { randomUUID } from 'node:crypto';
import { makeRect, makeText, makeEllipse, makeLine, wrapText } from '../excalidraw-helpers.js';
import { COLORS, SECTION_COLORS, FONT, CANVAS } from '../constants.js';

const BLOCK_X = CANVAS.padding;
const BLOCK_W = CANVAS.width - 2 * CANVAS.padding;
const BADGE_R = 20;
const INNER_PAD = 16;
const CONTENT_X = BLOCK_X + BADGE_R * 2 + 20;
const CONTENT_W = BLOCK_W - BADGE_R * 2 - 40;

export function buildGrid(sectionIndex, summary) {
  const elements = [];
  let cursorY = CANVAS.topStart;

  // --- Title banner ---
  const titleRect = makeRect({
    id: randomUUID(),
    x: BLOCK_X,
    y: cursorY,
    w: BLOCK_W,
    h: 60,
    fillColor: COLORS.stroke,
    roundness: 12,
  });
  elements.push(titleRect);

  const titleText = makeText({
    id: randomUUID(),
    x: BLOCK_X + 20,
    y: cursorY + 14,
    text: summary.heading,
    fontSize: FONT.title,
    color: COLORS.white,
  });
  elements.push(titleText);

  cursorY += 60 + 12;

  // --- Subheading ---
  if (summary.subheading) {
    const sub = makeText({
      id: randomUUID(),
      x: BLOCK_X + 10,
      y: cursorY,
      text: summary.subheading,
      fontSize: FONT.small,
      color: COLORS.textMuted,
    });
    elements.push(sub);
    cursorY += 24;
  }

  cursorY += 8;

  // --- Stats row ---
  if (summary.stats && summary.stats.length > 0) {
    const statW = Math.floor(BLOCK_W / Math.min(summary.stats.length, 4));
    for (let i = 0; i < Math.min(summary.stats.length, 4); i++) {
      const stat = summary.stats[i];
      const sx = BLOCK_X + i * statW;

      const statBg = makeRect({
        id: randomUUID(),
        x: sx + 4,
        y: cursorY,
        w: statW - 8,
        h: 70,
        fillColor: SECTION_COLORS[i % SECTION_COLORS.length],
        roundness: 10,
      });
      elements.push(statBg);

      const valText = makeText({
        id: randomUUID(),
        x: sx + 12,
        y: cursorY + 8,
        text: stat.value || stat,
        fontSize: FONT.heading,
        color: COLORS.textDark,
        textAlign: 'center',
        width: statW - 24,
      });
      elements.push(valText);

      const labelText = makeText({
        id: randomUUID(),
        x: sx + 12,
        y: cursorY + 40,
        text: wrapText(stat.label || '', statW - 24, FONT.caption),
        fontSize: FONT.caption,
        color: COLORS.textMuted,
        textAlign: 'center',
        width: statW - 24,
      });
      elements.push(labelText);
    }
    cursorY += 70 + 16;
  }

  // --- Bullet blocks ---
  const bullets = summary.bullets || [];
  for (let i = 0; i < bullets.length; i++) {
    const color = SECTION_COLORS[i % SECTION_COLORS.length];
    const bulletText = wrapText(bullets[i], CONTENT_W, FONT.body);
    const lineCount = bulletText.split('\n').length;
    const blockH = Math.max(BADGE_R * 2 + 8, lineCount * FONT.body * FONT.lineHeight + INNER_PAD * 2);

    // Background rect
    const bg = makeRect({
      id: randomUUID(),
      x: BLOCK_X,
      y: cursorY,
      w: BLOCK_W,
      h: blockH,
      fillColor: color,
      strokeColor: color,
      roundness: 10,
    });
    elements.push(bg);

    // Number badge
    const badge = makeEllipse({
      id: randomUUID(),
      x: BLOCK_X + 10,
      y: cursorY + (blockH - BADGE_R * 2) / 2,
      w: BADGE_R * 2,
      h: BADGE_R * 2,
      fillColor: COLORS.white,
      strokeColor: COLORS.stroke,
    });
    elements.push(badge);

    const numText = makeText({
      id: randomUUID(),
      x: BLOCK_X + 10 + BADGE_R - 5,
      y: cursorY + (blockH - FONT.body * FONT.lineHeight) / 2,
      text: `${i + 1}`,
      fontSize: FONT.body,
      color: COLORS.textDark,
      textAlign: 'center',
    });
    elements.push(numText);

    // Bullet text
    const txt = makeText({
      id: randomUUID(),
      x: CONTENT_X,
      y: cursorY + INNER_PAD,
      text: bulletText,
      fontSize: FONT.body,
      color: COLORS.textDark,
    });
    elements.push(txt);

    cursorY += blockH + 10;
  }

  // --- Divider line ---
  cursorY += 8;
  const divider = makeLine({
    id: randomUUID(),
    x: BLOCK_X + 40,
    y: cursorY,
    points: [[0, 0], [BLOCK_W - 80, 0]],
    color: COLORS.textMuted,
    strokeStyle: 'dashed',
  });
  elements.push(divider);
  cursorY += 16;

  // --- Source footer ---
  const footer = makeText({
    id: randomUUID(),
    x: BLOCK_X + 10,
    y: cursorY,
    text: 'Source: clockify.me/time-management-statistics',
    fontSize: FONT.caption,
    color: COLORS.textMuted,
  });
  elements.push(footer);

  return elements;
}
