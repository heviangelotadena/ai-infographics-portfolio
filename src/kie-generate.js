/**
 * KIE.ai Nano Banana 2 image generation script.
 *
 * Usage:
 *   node src/kie-generate.js --prompt "..." --output "./generated/image.png"
 *   node src/kie-generate.js --prompt "..." --output "./generated/image.png" --aspect 16:9 --size 2K
 *   node src/kie-generate.js --prompt "..." --output "./generated/image.png" --reference ./ref.png
 */

import 'dotenv/config';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const API_BASE = 'https://api.kie.ai/api/v1/jobs';
const API_KEY = process.env.KIE_API_KEY;

if (!API_KEY) {
  console.error('Error: KIE_API_KEY not set in environment or .env');
  process.exit(1);
}

// ── Parse CLI args ────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { prompt: '', output: '', aspect: '16:9', size: '2K', model: 'nano-banana-2', reference: null };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--prompt': opts.prompt = args[++i]; break;
      case '--output': opts.output = args[++i]; break;
      case '--aspect': opts.aspect = args[++i]; break;
      case '--size':   opts.size   = args[++i]; break;
      case '--model':  opts.model  = args[++i]; break;
      case '--reference': opts.reference = args[++i]; break;
    }
  }

  if (!opts.prompt || !opts.output) {
    console.error('Usage: node src/kie-generate.js --prompt "..." --output "./path.png" [--aspect 16:9] [--size 2K]');
    process.exit(1);
  }
  return opts;
}

// ── Upload reference image (if provided) ──────────────────────
async function uploadReference(filePath) {
  const data = await readFile(filePath);
  const blob = new Blob([data], { type: 'image/png' });
  const form = new FormData();
  form.append('file', blob, path.basename(filePath));

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (json.status !== 'success') throw new Error('tmpfiles upload failed: ' + JSON.stringify(json));
  // Convert URL to direct download link
  const url = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  console.log(`  Reference uploaded: ${url}`);
  return url;
}

// ── Create generation task ────────────────────────────────────
async function createTask(prompt, aspect, size, model, referenceUrl) {
  const body = {
    model,
    task_type: 'txt2img',
    input: {
      prompt,
      aspect_ratio: aspect,
      resolution: size,
    },
  };

  if (referenceUrl) {
    body.input.image_input = referenceUrl;
  }

  const res = await fetch(`${API_BASE}/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!json.data?.taskId) {
    throw new Error('Failed to create task: ' + JSON.stringify(json));
  }
  return json.data.taskId;
}

// ── Poll for result ───────────────────────────────────────────
async function pollResult(taskId, maxAttempts = 120) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000)); // 3s intervals

    const res = await fetch(`${API_BASE}/recordInfo?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const json = await res.json();
    const state = json.data?.state;

    if (state === 'success' || state === 'completed') {
      // resultJson is a stringified JSON with resultUrls array
      const resultJson = json.data?.resultJson;
      if (!resultJson) throw new Error('Task completed but no resultJson: ' + JSON.stringify(json.data));
      const parsed = JSON.parse(resultJson);
      const imageUrl = parsed.resultUrls?.[0];
      if (!imageUrl) throw new Error('No image URL in resultJson: ' + resultJson);
      return imageUrl;
    }

    if (state === 'failed' || state === 'error') {
      throw new Error(`Task failed: ${json.data?.failMsg || JSON.stringify(json.data)}`);
    }

    process.stdout.write(`\r  Polling... attempt ${i + 1}/${maxAttempts} (state: ${state || 'pending'})`);
  }
  throw new Error('Timed out waiting for image generation');
}

// ── Download image ────────────────────────────────────────────
async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();
  const outputPath = path.resolve(opts.output);

  console.log(`Generating image with KIE.ai ${opts.model}...`);
  console.log(`  Prompt: ${opts.prompt.slice(0, 100)}...`);
  console.log(`  Aspect: ${opts.aspect}, Size: ${opts.size}`);

  // Upload reference if provided
  let referenceUrl = null;
  if (opts.reference) {
    console.log(`  Uploading reference: ${opts.reference}`);
    referenceUrl = await uploadReference(opts.reference);
  }

  // Create task
  const taskId = await createTask(opts.prompt, opts.aspect, opts.size, opts.model, referenceUrl);
  console.log(`  Task created: ${taskId}`);

  // Poll for result
  const imageUrl = await pollResult(taskId);
  console.log(`\n  Image ready: ${imageUrl}`);

  // Download
  await downloadImage(imageUrl, outputPath);
  console.log(`  Saved: ${outputPath}`);
}

main().catch(err => { console.error('\nError:', err.message); process.exit(1); });
