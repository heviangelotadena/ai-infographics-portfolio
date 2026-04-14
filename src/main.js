import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseSections } from './parser.js';
import { summarizeSection } from './gemini.js';
import { buildGrid } from './layouts/grid.js';
import { buildFlow } from './layouts/flow.js';
import { buildMindmap } from './layouts/mindmap.js';
import { exportToPng } from './exporter.js';
import { makeDocument } from './excalidraw-helpers.js';
import { COLORS } from './constants.js';

const BASE_DIR = 'c:/Users/ADMIN/Desktop/Infographics';
const BLOG_PATH = path.join(BASE_DIR, 'references', 'blog-post.md');
const MAX_SECTIONS = 4;
const BATCH_SIZE = 2;

async function processSection(section, sectionIndex) {
  console.log(`\n--- Section ${sectionIndex}: ${section.heading} ---`);

  // 1. Summarize with Gemini
  console.log('  Summarizing with Gemini...');
  const summary = await summarizeSection(section.heading, section.body);
  console.log(`  Got: "${summary.heading}" — ${summary.bullets?.length || 0} bullets, ${summary.stats?.length || 0} stats`);

  // 2. Build all 3 layouts
  const layouts = {
    grid: buildGrid(sectionIndex, summary),
    flow: buildFlow(sectionIndex, summary),
    mindmap: buildMindmap(sectionIndex, summary),
  };

  // 3. Export each layout to PNG (sequentially to avoid overloading)
  const results = [];
  for (const [name, elements] of Object.entries(layouts)) {
    console.log(`  Generating ${name} layout...`);
    const doc = makeDocument(elements, COLORS.background);
    const pngPath = await exportToPng(doc, sectionIndex, name);
    results.push({ layout: name, png: pngPath });
  }

  return results;
}

async function main() {
  console.log('=== Excalidraw Infographic Generator ===\n');

  // 1. Verify API key
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY not found in environment or .env file');
    process.exit(1);
  }
  console.log('GEMINI_API_KEY: loaded');

  // 2. Load blog post
  console.log(`Loading blog post from: ${BLOG_PATH}`);
  const markdown = await readFile(BLOG_PATH, 'utf-8');

  // 3. Parse sections
  const allSections = parseSections(markdown);
  console.log(`Found ${allSections.length} sections total`);

  if (allSections.length < MAX_SECTIONS) {
    console.error(`ERROR: Need at least ${MAX_SECTIONS} sections, found ${allSections.length}`);
    process.exit(1);
  }

  // Pick the best 4 sections (skip very short ones like "Key Time Management Strategies")
  const sections = allSections
    .filter(s => s.body.length > 100)
    .slice(0, MAX_SECTIONS);

  console.log(`Processing ${sections.length} sections:`);
  sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.heading}`));

  // 4. Process in batches of 2
  const allResults = [];
  for (let i = 0; i < sections.length; i += BATCH_SIZE) {
    const batch = sections.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`\n========== BATCH ${batchNum}: sections ${i + 1} to ${i + batch.length} ==========`);

    // Process both sections in the batch sequentially
    // (parallel Firefox instances can be heavy on RAM)
    for (let j = 0; j < batch.length; j++) {
      const results = await processSection(batch[j], i + j + 1);
      allResults.push(...results);
    }
  }

  // 5. Summary
  console.log('\n========== COMPLETE ==========');
  console.log(`Generated ${allResults.length} infographic images:`);
  allResults.forEach(r => console.log(`  ${r.png}`));
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
