import { spawnSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = 'c:/Users/ADMIN/Desktop/Infographics';

export async function exportToPng(excalidrawData, sectionIndex, layoutName) {
  const outDir = path.join(BASE_DIR, 'generated', `section-${sectionIndex}`);
  await mkdir(outDir, { recursive: true });

  const jsonPath = path.resolve(outDir, `layout-${layoutName}.excalidraw`);
  const pngPath = path.resolve(outDir, `layout-${layoutName}.png`);

  // Write the .excalidraw JSON file
  await writeFile(jsonPath, JSON.stringify(excalidrawData, null, 2), 'utf-8');
  console.log(`  Written: ${jsonPath}`);

  // Export to PNG using excalidraw-brute-export-cli
  const cliPath = path.join(BASE_DIR, 'node_modules', '.bin', 'excalidraw-brute-export-cli');

  const result = spawnSync(
    cliPath,
    [
      '-i', jsonPath,
      '-o', pngPath,
      '--background', '1',
      '--embed-scene', '0',
      '--dark-mode', '0',
      '--scale', '2',
      '--format', 'png',
    ],
    {
      cwd: BASE_DIR,
      encoding: 'utf-8',
      timeout: 90000, // 90s to be safe
      shell: true,    // required on Windows for .cmd scripts
      env: { ...process.env },
    }
  );

  if (result.status !== 0) {
    console.error(`  Export FAILED for section-${sectionIndex}/${layoutName}:`);
    console.error('  stderr:', result.stderr?.slice(0, 500));
    console.error('  stdout:', result.stdout?.slice(0, 500));
    throw new Error(`Export failed: section-${sectionIndex}/layout-${layoutName}`);
  }

  console.log(`  Exported: ${pngPath}`);
  return pngPath;
}
