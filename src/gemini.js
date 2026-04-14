import { GoogleGenAI } from '@google/genai';

let ai;

function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function summarizeSection(sectionHeading, sectionText) {
  const client = getClient();

  const prompt = `You are summarizing a blog post section for a hand-drawn infographic.
Given the section below, return ONLY valid JSON (no markdown fences, no explanation).

Section heading: "${sectionHeading}"
Section text:
---
${sectionText.slice(0, 3000)}
---

Return this exact JSON structure:
{
  "heading": "short section title (max 35 chars)",
  "subheading": "one-sentence summary (max 70 chars)",
  "bullets": [
    "concise bullet point (max 50 chars each)"
  ],
  "stats": [
    { "value": "82%", "label": "short label (max 25 chars)" }
  ]
}

Rules:
- Include 3-5 bullets covering the key takeaways
- Include 2-4 stats with the most striking numbers from the section
- Keep all text short and punchy for an infographic
- Return ONLY the JSON object, nothing else`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text
    .replace(/^```json\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Retry with stricter instruction
    const retry = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Return ONLY a valid JSON object (no markdown, no text). Previous attempt failed to parse:\n${raw}\n\nFix the JSON and return it.`,
    });
    const retryRaw = retry.text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(retryRaw);
  }
}
