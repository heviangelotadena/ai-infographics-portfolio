import { readFile } from 'node:fs/promises';

export function parseSections(markdown) {
  const parts = markdown.split(/^(?=## )/m);
  const sections = [];

  for (const part of parts) {
    const headingMatch = part.match(/^## (.+)/);
    if (!headingMatch) continue;

    const heading = headingMatch[1].trim();
    const body = part.replace(/^## .+\n/, '').trim();
    if (body.length > 50) {
      sections.push({ heading, body });
    }
  }

  return sections;
}

export async function loadBlogPost(filePath) {
  const markdown = await readFile(filePath, 'utf-8');
  return markdown;
}
