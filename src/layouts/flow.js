import { randomUUID } from 'node:crypto';
import { makeRect, makeText, makeEllipse, makeArrow, wrapText, bindArrow, bindTextToContainer } from '../excalidraw-helpers.js';
import { COLORS, SECTION_COLORS, FONT, CANVAS } from '../constants.js';

const NODE_W = 520;
const NODE_X = (CANVAS.width - NODE_W) / 2;
const NODE_PAD = 16;
const ARROW_GAP = 50;

export function buildFlow(sectionIndex, summary) {
  const elements = [];
  let cursorY = CANVAS.topStart;

  // --- Title text ---
  const titleText = makeText({
    id: randomUUID(),
    x: (CANVAS.width - NODE_W) / 2,
    y: cursorY,
    text: summary.heading,
    fontSize: FONT.title,
    color: COLORS.textDark,
    textAlign: 'center',
    width: NODE_W,
  });
  elements.push(titleText);
  cursorY += 50;

  // --- Subheading ---
  if (summary.subheading) {
    const sub = makeText({
      id: randomUUID(),
      x: NODE_X,
      y: cursorY,
      text: summary.subheading,
      fontSize: FONT.small,
      color: COLORS.textMuted,
      textAlign: 'center',
      width: NODE_W,
    });
    elements.push(sub);
    cursorY += 28;
  }

  cursorY += 16;

  // --- Start oval ---
  const startId = randomUUID();
  const startOval = makeEllipse({
    id: startId,
    x: (CANVAS.width - 160) / 2,
    y: cursorY,
    w: 160,
    h: 50,
    fillColor: COLORS.sageGreen,
    strokeColor: COLORS.stroke,
  });
  elements.push(startOval);

  const startLabel = makeText({
    id: randomUUID(),
    x: (CANVAS.width - 100) / 2,
    y: cursorY + 12,
    text: 'Key Facts',
    fontSize: FONT.body,
    color: COLORS.textDark,
    textAlign: 'center',
    containerId: startId,
  });
  bindTextToContainer(startOval, startLabel);
  elements.push(startLabel);
  cursorY += 50;

  // --- Content nodes ---
  const bullets = summary.bullets || [];
  const stats = summary.stats || [];
  let prevElement = startOval;

  for (let i = 0; i < bullets.length; i++) {
    // Arrow from previous to this node
    const arrowId = randomUUID();
    const arrow = makeArrow({
      id: arrowId,
      x: CANVAS.width / 2,
      y: cursorY,
      points: [[0, 0], [0, ARROW_GAP]],
      color: COLORS.textMuted,
    });
    cursorY += ARROW_GAP;

    // Node rectangle
    const nodeId = randomUUID();
    const color = SECTION_COLORS[i % SECTION_COLORS.length];
    const wrappedText = wrapText(bullets[i], NODE_W - NODE_PAD * 2, FONT.body);
    const lineCount = wrappedText.split('\n').length;
    const nodeH = Math.max(60, lineCount * FONT.body * FONT.lineHeight + NODE_PAD * 2);

    const nodeRect = makeRect({
      id: nodeId,
      x: NODE_X,
      y: cursorY,
      w: NODE_W,
      h: nodeH,
      fillColor: color,
      roundness: 12,
    });

    // Bind arrow
    bindArrow(arrow, prevElement, nodeRect);
    elements.push(arrow);
    elements.push(nodeRect);

    // Node text
    const nodeText = makeText({
      id: randomUUID(),
      x: NODE_X + NODE_PAD,
      y: cursorY + NODE_PAD,
      text: wrappedText,
      fontSize: FONT.body,
      color: COLORS.textDark,
    });
    elements.push(nodeText);

    // Stat callout on alternating sides
    if (i < stats.length && stats[i]) {
      const stat = stats[i];
      const statText = `${stat.value || stat}\n${stat.label || ''}`.trim();
      const isLeft = i % 2 === 0;
      const calloutX = isLeft ? NODE_X - 160 : NODE_X + NODE_W + 20;

      const calloutRect = makeRect({
        id: randomUUID(),
        x: calloutX,
        y: cursorY + 5,
        w: 140,
        h: 50,
        fillColor: COLORS.white,
        strokeColor: color,
        roundness: 8,
        strokeStyle: 'dashed',
      });
      elements.push(calloutRect);

      const calloutText = makeText({
        id: randomUUID(),
        x: calloutX + 8,
        y: cursorY + 12,
        text: statText,
        fontSize: FONT.small,
        color: COLORS.textDark,
        textAlign: 'center',
        width: 124,
      });
      elements.push(calloutText);
    }

    cursorY += nodeH;
    prevElement = nodeRect;
  }

  // --- End oval ---
  cursorY += 8;
  const endArrowId = randomUUID();
  const endArrow = makeArrow({
    id: endArrowId,
    x: CANVAS.width / 2,
    y: cursorY,
    points: [[0, 0], [0, ARROW_GAP]],
    color: COLORS.textMuted,
  });
  cursorY += ARROW_GAP;

  const endId = randomUUID();
  const endOval = makeEllipse({
    id: endId,
    x: (CANVAS.width - 180) / 2,
    y: cursorY,
    w: 180,
    h: 50,
    fillColor: COLORS.accent,
    strokeColor: COLORS.stroke,
  });

  bindArrow(endArrow, prevElement, endOval);
  elements.push(endArrow);
  elements.push(endOval);

  const endLabel = makeText({
    id: randomUUID(),
    x: (CANVAS.width - 120) / 2,
    y: cursorY + 12,
    text: 'Take Action!',
    fontSize: FONT.body,
    color: COLORS.textDark,
    textAlign: 'center',
    containerId: endId,
  });
  bindTextToContainer(endOval, endLabel);
  elements.push(endLabel);

  cursorY += 60;

  // --- Source footer ---
  const footer = makeText({
    id: randomUUID(),
    x: NODE_X,
    y: cursorY,
    text: 'Source: clockify.me/time-management-statistics',
    fontSize: FONT.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    width: NODE_W,
  });
  elements.push(footer);

  return elements;
}
