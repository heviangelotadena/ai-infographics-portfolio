import { randomUUID, randomInt } from 'node:crypto';
import { COLORS, FONT, ELEMENT } from './constants.js';

function randSeed() {
  return randomInt(1, 2 ** 31);
}

function baseProps(id, type, x, y, w, h) {
  return {
    id: id || randomUUID(),
    type,
    x,
    y,
    width: w,
    height: h,
    angle: 0,
    strokeColor: COLORS.stroke,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: null,
    roundness: null,
    seed: randSeed(),
    version: 1,
    versionNonce: randSeed(),
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
  };
}

export function makeRect({ id, x, y, w, h, fillColor, strokeColor, roundness, strokeStyle } = {}) {
  return {
    ...baseProps(id, 'rectangle', x, y, w, h),
    backgroundColor: fillColor || 'transparent',
    strokeColor: strokeColor || COLORS.stroke,
    strokeStyle: strokeStyle || 'solid',
    roundness: roundness !== undefined
      ? { type: 3, value: roundness }
      : { type: 3, value: ELEMENT.cornerRadius },
  };
}

export function makeEllipse({ id, x, y, w, h, fillColor, strokeColor } = {}) {
  return {
    ...baseProps(id, 'ellipse', x, y, w, h),
    backgroundColor: fillColor || 'transparent',
    strokeColor: strokeColor || COLORS.stroke,
    roundness: null,
  };
}

export function makeDiamond({ id, x, y, w, h, fillColor, strokeColor } = {}) {
  return {
    ...baseProps(id, 'diamond', x, y, w, h),
    backgroundColor: fillColor || 'transparent',
    strokeColor: strokeColor || COLORS.stroke,
    roundness: null,
  };
}

export function makeText({ id, x, y, text, fontSize, color, textAlign, verticalAlign, containerId, width } = {}) {
  const fs = fontSize || FONT.body;
  const lines = text.split('\n');
  const maxLineLen = Math.max(...lines.map(l => l.length));
  const computedWidth = width || Math.ceil(maxLineLen * fs * ELEMENT.charWidthFactor) + 4;
  const computedHeight = Math.ceil(lines.length * fs * FONT.lineHeight) + 4;

  return {
    ...baseProps(id, 'text', x, y, computedWidth, computedHeight),
    text,
    originalText: text,
    fontSize: fs,
    fontFamily: FONT.family,
    textAlign: textAlign || 'left',
    verticalAlign: verticalAlign || 'top',
    containerId: containerId || null,
    autoResize: false,
    lineHeight: FONT.lineHeight,
    strokeColor: color || COLORS.textDark,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 0,
    roughness: 0,
  };
}

export function makeArrow({ id, x, y, points, color, startBinding, endBinding } = {}) {
  const pts = points || [[0, 0], [0, 50]];
  // Compute bounding box for width/height
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) || 1;
  const h = Math.max(...ys) - Math.min(...ys) || 1;

  return {
    ...baseProps(id, 'arrow', x, y, w, h),
    points: pts,
    strokeColor: color || COLORS.stroke,
    startBinding: startBinding || null,
    endBinding: endBinding || null,
    startArrowhead: null,
    endArrowhead: 'arrow',
    roundness: { type: 2 },
    lastCommittedPoint: null,
    elbowed: false,
  };
}

export function makeLine({ id, x, y, points, color, strokeStyle } = {}) {
  const pts = points || [[0, 0], [100, 0]];
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) || 1;
  const h = Math.max(...ys) - Math.min(...ys) || 1;

  return {
    ...baseProps(id, 'line', x, y, w, h),
    points: pts,
    strokeColor: color || COLORS.stroke,
    strokeStyle: strokeStyle || 'dashed',
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
    roundness: { type: 2 },
    lastCommittedPoint: null,
    elbowed: false,
  };
}

/**
 * Wrap text into lines that fit within maxWidth pixels.
 * Returns the wrapped text string with \n separators.
 */
export function wrapText(text, maxWidthPx, fontSize) {
  const fs = fontSize || FONT.body;
  const charW = fs * ELEMENT.charWidthFactor;
  const maxChars = Math.floor(maxWidthPx / charW);

  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars - 1) + '\u2026' : word;
    }
  }
  if (current) lines.push(current);

  return lines.join('\n');
}

/**
 * Compute text height in pixels given line count and font size.
 */
export function textHeight(lineCount, fontSize) {
  return Math.ceil(lineCount * (fontSize || FONT.body) * FONT.lineHeight) + 4;
}

/**
 * Add bidirectional arrow binding between arrow and two elements.
 * Mutates the elements in place.
 */
export function bindArrow(arrow, fromElement, toElement) {
  const arrowId = arrow.id;
  arrow.startBinding = { elementId: fromElement.id, focus: 0, gap: 4, fixedPoint: null };
  arrow.endBinding = { elementId: toElement.id, focus: 0, gap: 4, fixedPoint: null };
  fromElement.boundElements = [...(fromElement.boundElements || []), { type: 'arrow', id: arrowId }];
  toElement.boundElements = [...(toElement.boundElements || []), { type: 'arrow', id: arrowId }];
}

/**
 * Add text binding to a container element.
 * Mutates both elements in place.
 */
export function bindTextToContainer(container, textEl) {
  textEl.containerId = container.id;
  container.boundElements = [...(container.boundElements || []), { type: 'text', id: textEl.id }];
}

/**
 * Build a complete .excalidraw document from elements array.
 */
export function makeDocument(elements, bgColor) {
  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: {
      gridSize: 20,
      gridStep: 5,
      gridModeEnabled: false,
      viewBackgroundColor: bgColor || COLORS.background,
    },
    files: {},
  };
}
