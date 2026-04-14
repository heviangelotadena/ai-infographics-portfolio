# Infographic Generation Project Summary

## Overview

This project used **Claude Code** and **Kie.ai Nano Banana 2** to generate professional hand-drawn infographic images from web-sourced content. No design skills were required — just clear prompts and iterative refinement. All images were generated locally via API calls, saved in the `generated/` folder.

**Tools Used:**
- Claude Code (content research, prompt crafting, API orchestration)
- Kie.ai Nano Banana 2 API (`nano-banana-2` model via `api.kie.ai`)
- 2K resolution, portrait 9:16 aspect ratio, PNG output

---

## Topic 1: Healthy Snacks Guide

### Content Sources
- [CDC — How to Have Healthier Meals and Snacks](https://www.cdc.gov/healthy-weight-growth/healthy-eating/meals-snacks.html)
- [TODAY — Best Healthy Snacks in 2026 Per Nutrition Experts](https://www.today.com/shop/best-healthy-snacks-today-show-rcna252605)

### Sections Extracted
1. **Smart Picks** — Fresh fruits (mangoes, citrus), raw veggies (carrots, celery, cucumbers)
2. **Protein Power** — Greek yogurt, nuts & seeds, turkey sticks (12g protein), edamame (13g protein)
3. **Fiber Fills You Up** — Whole-grain crackers, popcorn, chia pudding — aim for 3-5g fiber per snack
4. **Smart Habits** — Portion into bowls, keep healthy snacks at eye level, stock nutritious options at work
5. **Avoid These** — Added sugars, ultra-processed foods, sugary drinks

### Prompts & Outputs

**Variation 1 — Structured Grid Layout** (`healthy-snacks-v1-sketch.png`, 6.9 MB)
- **Prompt approach:** Described a vertical stacked layout with 5 numbered sections separated by sketchy dividers. Each section included specific sketch icons (e.g., "sketch icons of a mango, orange citrus, carrot sticks") and annotation callouts (e.g., "12-13g protein per serving"). Specified Excalidraw hand-drawn style, soft pastels (sage green, warm peach, sky blue, pale yellow), off-white background, and no photorealism.
- **Output:** Clean grid infographic with all 5 sections, hand-drawn icons for each food category, readable annotations, and a source footer. The stacked layout makes it easy to scan top-to-bottom.

**Variation 2 — Flow/Journey Layout** (`healthy-snacks-v2-sketch.png`, 7.7 MB)
- **Prompt approach:** Used a flow-chart/journey map structure with branching nodes connected by hand-drawn arrows. Title used a "sketchy starburst." Each node represented a snack-building step (Choose a Smart Base -> Add Protein -> Boost with Fiber -> Stay Hydrated -> Avoid Traps). Different pastel palette (lavender, mint green, warm coral, butter yellow).
- **Output:** Engaging decision-tree style infographic with connected nodes, checkmark badges, and callout boxes. More visual narrative than V1, guiding the reader through a snacking journey.

---

## Topic 2: iPhone 17 Series

### Content Sources
- [T-Mobile — iPhone 17 Series: Features, Design, Specs, and More](https://www.t-mobile.com/dialed-in/devices/iphone-17-series)
- [MacRumors — iPhone 17: Everything We Know](https://www.macrumors.com/roundup/iphone-17/)
- [9to5Mac — iPhone 17 Pro Back Design](https://9to5mac.com/2025/09/05/iphone-17-pro-back-design/)
- [Apple — iPhone 17 Pro](https://www.apple.com/iphone-17-pro/)

### Sections Extracted
1. **The Lineup** — iPhone 17e ($599), iPhone 17 ($799), iPhone Air ($999), iPhone 17 Pro ($1,099), iPhone 17 Pro Max ($1,199)
2. **Design** — iPhone Air ultra-thin at 5.64mm; Ceramic Shield 2 (3x scratch resistance); Cosmic Orange color; two-tone aluminum/glass split back on Pro models
3. **Display** — 6.1"–6.9" OLED; 120Hz ProMotion; 3,000 nits peak brightness; Always-On
4. **Camera** — Dual/Triple 48MP systems; 8x optical zoom on Pro; 18MP square front sensor; Dual Capture (front+rear 4K simultaneously)
5. **Performance & Battery** — A19/A19 Pro chips; N1 networking chip (Wi-Fi 7); up to 39hrs video; 25W MagSafe; vapor chamber cooling

### Prompts & Outputs

**Variation 3 — Product Lineup Overview** (`infographic_v3.png`, 7.3 MB)
- **Prompt approach:** Described all 5 models shown from the back with price tags. Emphasized the two-tone split back design (aluminum upper, glass lower) on Pro models. Used a reference image of actual iPhone 17 back designs to ensure accuracy. Multiple iterations were needed to get the camera module designs right.
- **Output:** Lineup overview showing all models with correct back designs, price labels, and annotations for key design features.

**Variation 3-1 — Refined with Camera Corrections** (`infographic_v3-1.png`, 7.0 MB)
- **Prompt approach:** After user feedback that the Pro Max design was inaccurate, a reference image (`iphone-17-comparison-02.avif`) was provided. The prompt was refined with exact camera module descriptions: iPhone 17 has diagonal dual-camera in rounded square, Air has horizontal pill-shaped module, Pro/Pro Max have triangular triple-camera in square bump. The reference image was uploaded and passed as `image_input` to guide the model.
- **Output:** More accurate phone illustrations matching Apple's real-world design language, with correct camera placements and the two-tone split back clearly shown.

**Variation 4 — Feature Spotlight Flow** (`infographic_v4.png`, 5.4 MB)
- **Prompt approach:** Flow-chart layout with 5 connected nodes highlighting standout new features: Ultra-Thin Air, Camera Revolution, Brilliant Display, A19 Pro Power, All Day Battery. Price range banner at bottom. Pastel palette (lavender, mint, peach, light gray).
- **Output:** Journey-map style infographic with arrows connecting feature nodes, callout boxes with specs, and a clean Excalidraw aesthetic.

### Key Lesson: Iterative Refinement
The iPhone 17 infographics required **multiple iterations** to get the phone designs accurate. The initial prompts produced generic phone sketches that didn't match the actual products. The breakthrough came from:
1. Providing a **reference image** showing the real phone backs
2. Using the Kie.ai `image_input` parameter to feed the reference to the model
3. Being extremely **specific about camera module geometry** (diagonal vs triangular vs horizontal pill)

---

## Topic 3: iPhone 15 Series

### Content Sources
- [Apple — iPhone 15 Tech Specs](https://support.apple.com/en-us/111831)
- [Apple — Compare iPhone 15 Models](https://www.apple.com/iphone/compare/?modelList=iphone-15-pro,iphone-15-pro-max,iphone-15)
- [Macworld — iPhone 15 Complete Guide](https://www.macworld.com/article/1351959/iphone-15-plus-pro-max-specs-release-price.html)
- [GSMArena — Apple iPhone 15](https://www.gsmarena.com/apple_iphone_15-12559.php)

### Sections Extracted
1. **The Lineup** — iPhone 15 ($799), 15 Plus ($899), 15 Pro ($999), 15 Pro Max ($1,199)
2. **Design** — First USB-C iPhones ever; Dynamic Island on all models; Aluminum (15/Plus) vs Titanium (Pro/Pro Max); Action button on Pro; IP68
3. **Display** — 6.1" & 6.7" OLED; 60Hz (15/Plus) vs 120Hz ProMotion (Pro/Pro Max); Always-On on Pro; 2,000 nits
4. **Camera** — 48MP main on all; Dual diagonal (15/Plus: 48MP + 12MP UW); Triple triangular (Pro: 3x zoom, Pro Max: 5x tetraprism); LiDAR on Pro
5. **Performance & Battery** — A16 Bionic vs A17 Pro (first 3nm chip); up to 29hrs video; 15W MagSafe

### Prompts & Outputs

**Reference Chart** (`iphone15_ref.png`, 5.2 MB)
- **Prompt approach:** Before creating infographics, a reference phone chart was generated showing all 4 models from the back with accurate camera modules. This established the correct visual language: diagonal dual cameras on 15/Plus, triangular triple cameras on Pro/Pro Max, with correct color variants for each model.
- **Output:** Clean comparison chart with 4 rows (iPhone 15, 15 Plus, 15 Pro, 15 Pro Max) showing each model's back in all available colors.

**Variation 1 — Product Lineup Overview** (`iphone15_v1.png`, 5.6 MB)
- **Prompt approach:** Used the reference chart as `image_input`. Described 5 sections covering lineup, design (USB-C, Dynamic Island, Titanium vs Aluminum), display (60Hz vs 120Hz), camera (diagonal vs triangular, 5x tetraprism), and performance (A16 vs A17 Pro). Specified pink/sky blue/mint green/warm gold pastels.
- **Output:** Comprehensive grid infographic with accurate phone illustrations, all specs organized clearly, and the Excalidraw hand-drawn aesthetic.

**Variation 2 — Feature Spotlight Flow** (`iphone15_v2.png`, 6.8 MB)
- **Prompt approach:** Flow-chart with 5 milestone nodes: USB-C Arrives (goodbye Lightning after 11 years), Dynamic Island for All, Titanium Pro, 48MP Camera, A17 Pro Chip (first 3nm). Each node had annotation bubbles with key details. Price range banner at bottom.
- **Output:** Engaging journey-map infographic highlighting what made the iPhone 15 series special, with connecting arrows and callout boxes.

---

## Prompt Writing Lessons

### What Worked Well
- **Specific icon descriptions** — Naming exact objects to sketch ("Greek yogurt cup, almonds and mixed nuts, turkey stick") produced recognizable illustrations
- **Section-by-section structure** — Numbering sections and describing each one individually kept the layout organized
- **Style constraints** — Explicitly stating "no photorealism, no gradients, no 3D" prevented the model from drifting away from the hand-drawn aesthetic
- **Reference images** — Using `image_input` with a reference photo dramatically improved accuracy for product-specific illustrations
- **Color palette specification** — Naming specific pastels (sage green, warm peach, lavender) ensured visual consistency

### What Required Iteration
- **Product accuracy** — AI image models struggle to reproduce exact product designs from text alone. Reference images are essential for accuracy
- **Camera module geometry** — Describing "diagonal dual" vs "triangular triple" vs "horizontal pill" took several attempts before the model understood the precise layouts
- **Two-tone materials** — The iPhone 17 Pro's aluminum/glass split-back design needed explicit descriptions like "upper half is aluminum, lower half is glass" with labeled sections

### Prompt Structure Template
```
1. Style declaration (Excalidraw, hand-drawn, sketch lines)
2. Color palette (specific pastel names)
3. Orientation and layout (portrait 9:16, stacked/flow)
4. Title and section descriptions (numbered, with specific icons)
5. Annotations and callouts (key data points)
6. Negative constraints (no photorealism, no gradients)
7. Readability reminder (readable text, not overcrowded)
```

---

## File Inventory

| File | Topic | Type | Size |
|------|-------|------|------|
| `healthy-snacks-v1-sketch.png` | Healthy Snacks | Grid layout | 6.9 MB |
| `healthy-snacks-v2-sketch.png` | Healthy Snacks | Flow layout | 7.7 MB |
| `infographic_v3.png` | iPhone 17 | Lineup overview | 7.3 MB |
| `infographic_v3-1.png` | iPhone 17 | Refined with camera corrections | 7.0 MB |
| `infographic_v4.png` | iPhone 17 | Feature spotlight flow | 5.4 MB |
| `iphone15_ref.png` | iPhone 15 | Reference phone chart | 5.2 MB |
| `iphone15_v1.png` | iPhone 15 | Lineup overview | 5.6 MB |
| `iphone15_v2.png` | iPhone 15 | Feature spotlight flow | 6.8 MB |
| `threadpup-architecture.excalidraw` | ThreadPup | Architecture (editable) | 57 KB |
| `threadpup-architecture-excalidraw.png` | ThreadPup | Architecture PNG (2x) | 341 KB |
| `threadpup-architecture.svg` | ThreadPup | Architecture SVG | 46 KB |
| `threadpup-architecture.png` | ThreadPup | Architecture (AI-generated) | 578 KB |
| `threadpup-journey.excalidraw` | ThreadPup | Customer Journey (editable) | 90 KB |
| `threadpup-journey.png` | ThreadPup | Customer Journey PNG (2x) | 453 KB |
| `threadpup-journey.svg` | ThreadPup | Customer Journey SVG | 86 KB |

**Total: 15 images + 2 .excalidraw + 2 .svg, ~54 MB**

---

## Technical Setup

- **Image Generation API:** Kie.ai Nano Banana 2 (`nano-banana-2` model)
- **API Endpoint:** `https://api.kie.ai/api/v1/jobs/createTask`
- **Polling Endpoint:** `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...`
- **Resolution:** 2K
- **Aspect Ratio:** 9:16 (portrait)
- **Output Format:** PNG
- **Authentication:** Bearer token via `KIE_API_KEY`
- **Reference Images:** Uploaded to tmpfiles.org and passed via `image_input` parameter

Built with Claude Code + Kie.ai Nano Banana 2

---

## Native Excalidraw Diagrams from a Prompt

### Overview

This phase generated **real Excalidraw infographics** programmatically — not AI-generated images mimicking the style, but actual `.excalidraw` JSON files rendered to PNG via a headless browser. A productivity blog post was fetched, split into sections, summarized by Gemini AI, and converted into hand-drawn diagrams using Excalidraw's native element format.

**Tools Used:**
- Claude Code (orchestration, code generation, image review)
- Gemini 2.5 Flash (content summarization into structured JSON)
- Node.js script generating Excalidraw JSON (rectangles, ellipses, arrows, text elements)
- `excalidraw-brute-export-cli` + Playwright Firefox (headless PNG export)

### Content Source

- [Clockify — Time Management Statistics (2026 Edition)](https://clockify.me/time-management-statistics)
- Saved locally as `references/blog-post.md`

### Sections Processed

The blog post was split on `##` headings. The 4 strongest sections (by data richness) were selected:

1. **General Time Management Statistics** — 82% lack a system, Eisenhower Matrix, Pomodoro Technique
2. **Time Management in the Workplace** — 88% of workweek on communication, 19 hrs lost weekly, 49% distracted by phones
3. **Internet and Online Time Statistics** — 6h 38m daily online, 3h 14m on smartphones, 2.5+ hrs social media
4. **Sleep and Time Management** — Japan sleeps 6h 10m, 46% with poor sleep report mental health issues

### Pipeline Architecture

A Node.js project (`src/`) with modular components:

| File | Role |
|------|------|
| `src/constants.js` | Pastel color palette, font sizes, canvas dimensions |
| `src/excalidraw-helpers.js` | Element factories (`makeRect`, `makeText`, `makeArrow`, `makeEllipse`), text wrapping, arrow binding |
| `src/parser.js` | Splits markdown on `##` headings |
| `src/gemini.js` | Sends each section to Gemini 2.5 Flash, returns structured JSON (heading, bullets, stats) |
| `src/layouts/grid.js` | Structured Grid — title banner, stats row, numbered colored blocks |
| `src/layouts/flow.js` | Flow/Journey Map — connected nodes with arrows, stat callouts on alternating sides |
| `src/layouts/mindmap.js` | Mind Map/Radial — central ellipse with branches to satellite nodes |
| `src/exporter.js` | Writes `.excalidraw` JSON, calls `excalidraw-brute-export-cli` via Playwright Firefox |
| `src/main.js` | Orchestrator — loads blog, parses, batches 2 sections at a time |

### 3 Layout Variations Per Section

Each section was rendered in 3 different Excalidraw layouts:

- **Grid** — Vertical stacked blocks with number badges, pastel backgrounds, and a stats row at top
- **Flow** — Top-to-bottom connected nodes with arrows and dashed stat callout boxes on alternating sides
- **Mind Map** — Central ellipse with radial branches to satellite shapes (ellipses, rounded rects)

### Best Image Selection

After reviewing all 12 images, the clearest infographic per section was selected for a carousel:

| Section | Winner | Reason |
|---------|--------|--------|
| 1. Time Management Stats | Grid | Stats row (82%, 21%, 50%, 60%) pops instantly, clean numbered blocks |
| 2. Workplace Time Management | Grid | Striking workplace stats, highly scannable layout |
| 3. Internet & Online Stats | Flow | Adds carousel variety, internet usage reads well as progression |
| 4. Sleep & Mental Health | Flow | Sleep deprivation narrative flows naturally top-to-bottom |

Mind maps were eliminated across all sections due to arrow-text overlap issues in the radial layout.

### Output

**12 generated infographics (3 per section) + 4 selected best images:**

| File | Section | Layout | Size |
|------|---------|--------|------|
| `generated/section-1/layout-grid.png` | Time Management Stats | Grid | 205K |
| `generated/section-1/layout-flow.png` | Time Management Stats | Flow | 246K |
| `generated/section-1/layout-mindmap.png` | Time Management Stats | Mind Map | 258K |
| `generated/section-2/layout-grid.png` | Workplace Time Mgmt | Grid | 206K |
| `generated/section-2/layout-flow.png` | Workplace Time Mgmt | Flow | 249K |
| `generated/section-2/layout-mindmap.png` | Workplace Time Mgmt | Mind Map | 262K |
| `generated/section-3/layout-grid.png` | Internet & Online | Grid | 180K |
| `generated/section-3/layout-flow.png` | Internet & Online | Flow | 213K |
| `generated/section-3/layout-mindmap.png` | Internet & Online | Mind Map | 222K |
| `generated/section-4/layout-grid.png` | Sleep & Mental Health | Grid | 180K |
| `generated/section-4/layout-flow.png` | Sleep & Mental Health | Flow | 218K |
| `generated/section-4/layout-mindmap.png` | Sleep & Mental Health | Mind Map | 236K |

**Selected carousel images:** `generated/selected/section-1.png` through `section-4.png`

### Technical Setup

- **Excalidraw JSON:** Programmatic element generation (rectangles, ellipses, arrows, text with manual line wrapping)
- **Font:** Virgil (fontFamily: 1) — Excalidraw's native hand-drawn font
- **Export:** `excalidraw-brute-export-cli` v0.4.0 with Playwright Firefox, scale 2x
- **AI Summarization:** `@google/genai` SDK, Gemini 2.5 Flash model
- **Batching:** 2 sections at a time to avoid API rate limits
- **Color Palette:** sage green `#b5c9b5`, warm peach `#f4c9a8`, sky blue `#aed4e6`, pale yellow `#f5e6a3`, lavender `#d4c5e8`, mint `#b8e0d2`
- **Background:** warm off-white `#fdf8f0`
- **Node.js:** v24.14.0, ESM modules
- **Dependencies:** `@google/genai`, `dotenv`, `excalidraw-brute-export-cli`

### Key Lesson: Excalidraw vs AI Image Generation

Unlike the previous AI-generated infographics (Nano Banana 2), this approach produces **editable diagrams**. The `.excalidraw` files can be opened in excalidraw.com for manual refinement — no account needed. The tradeoff: programmatic layouts require explicit positioning math (text wrapping, arrow binding, coordinate calculations), while AI image generation handles layout automatically from a text prompt. The mind map layout revealed that radial coordinate math is harder to get right — arrows frequently overlapped satellite text, making grid and flow layouts more reliable for automated generation.

Built with Claude Code + Excalidraw + Gemini 2.5 Flash

---

## Generate Architecture Diagram Infographic

### Overview

This phase created two professional Excalidraw infographics for **ThreadPup**, a fictional e-commerce site selling dog merchandise: a **system architecture diagram** and a **customer journey timeline**. Both were built programmatically using the existing Excalidraw pipeline (`excalidraw-helpers.js`, `excalidraw-brute-export-cli`) and exported as editable `.excalidraw` files, 2x PNG, and SVG.

**Tools Used:**
- Claude Code (diagram design, coordinate math, iterative visual review)
- Excalidraw JSON (programmatic element generation)
- `excalidraw-brute-export-cli` + Playwright Firefox (headless export at 2x scale)
- Kie.ai Nano Banana 2 (initial AI-generated version for reference)

### Step 1: System Architecture Diagram

**Goal:** Represent the ThreadPup e-commerce system architecture with color-coded components and data flow arrows.

**Components included:**
1. **Customer Browser** — visits threadpup.com
2. **Next.js Storefront** — hosted on Vercel
3. **Supabase** — Database + Auth (product data, sessions)
4. **Stripe** — Payment Processing
5. **Fulfillment API** — triggered on payment success
6. **Print Shop** — Production & Shipping (prints dog merch)
7. **Resend** — Email notifications (Order Confirmation, Shipping Notification, Delivery Update)

**Color coding:**
| Color | Hex | Category |
|-------|-----|----------|
| Pastel sky blue | `#B8D4E8` | Customer-facing (Browser, Storefront) |
| Pastel sage green | `#B8D9C4` | Backend services (Fulfillment API, Print Shop) |
| Pastel warm orange | `#F2C894` | Third-party APIs (Supabase, Stripe, Resend) |

**Layout:** Top-to-bottom layered flow with a right sidebar for the Resend email chain. The main flow runs vertically from Customer Browser → Storefront → Supabase/Stripe (split row) → Fulfillment API → Print Shop. The Resend sidebar shows three email notification boxes with dashed arrows connecting to the main flow at trigger points.

**Arrow types:**
- Solid arrows → primary data flow (requests, payments, print jobs)
- Dashed arrows → secondary/notification flows (product data return, email triggers)

**Iterative refinement (3 passes):**
1. **V1:** Labels overlapped — "product data + session" collided with "fetch products + auth" on the left side; sidebar "on..." labels at 10px were barely readable
2. **V2:** Repositioned split arrow labels further outward, bumped sidebar labels to 11px, increased vertical spacing between Storefront and Supabase/Stripe row from 90px to 110px
3. **V3:** Rerouted the Supabase return arrow from the right edge (cutting through center zone) to the top-right corner; widened canvas from 1020px to 1060px for sidebar breathing room

**AI-generated version:** Before building in Excalidraw, a hand-drawn sketch version was generated via Kie.ai Nano Banana 2 API (`threadpup-architecture.png`, 578 KB). The Gemini API daily free-tier quota was exhausted from earlier work, so the Kie.ai API was used as a fallback. This provided a visual reference for the programmatic Excalidraw layout.

**Build script:** `src/build-architecture.js` — run with `node src/build-architecture.js`

### Step 2: Customer Journey Timeline

**Goal:** Show the complete ThreadPup customer journey as a horizontal timeline with 12 stages color-coded by phase.

**12 journey stages:**
1. Discovery (Social media & Google Ads)
2. Landing Page (threadpup.com homepage)
3. Browse Catalog (Filter by breed & category)
4. Customize Shirt (Pick breed, size & design)
5. Add to Cart (Review selections)
6. Checkout (Pay with Stripe)
7. Order Confirmation (Email via Resend)
8. Production (Print shop, 2–3 days)
9. Shipping Notice (Tracking email sent)
10. Delivery (Package arrives)
11. Review Request (Feedback email)
12. Repeat Purchase (Loyal customer)

**Phase color coding:**
| Phase | Color | Hex | Stages |
|-------|-------|-----|--------|
| Awareness | Purple | `#D4C5E8` | 1–2 |
| Consideration | Blue | `#B8D4E8` | 3–4 |
| Purchase | Green | `#B8D9C4` | 5–7 |
| Post-Purchase | Orange | `#F2C894` | 8–12 |

**Layout:** Wide horizontal canvas (~2260px) with four colored phase bands as backgrounds. Each stage is a numbered rounded rectangle node sitting on a horizontal timeline. Descriptions appear below each node. A dashed loop-back arrow runs from "Repeat Purchase" back to "Discovery" along the bottom ("Loyal customer returns!").

**Visual elements:**
- Numbered badges (1–12) above each node with phase accent colors
- Phase labels in large text at the top of each background band
- Horizontal arrows connecting all stages
- Loop-back arrow showing the repeat purchase cycle
- Legend with all 4 phase colors

**Iterative refinement (2 passes):**
1. **V1:** Phase background bands too subtle (opacity 30), node text too small (14px), phase labels in body font
2. **V2:** Increased band opacity to 40, enlarged node text to 16px, bumped phase labels to heading size (22px), widened nodes from 120px to 130px

**Build script:** `src/build-journey.js` — run with `node src/build-journey.js`

### Output Files

| File | Diagram | Format | Size |
|------|---------|--------|------|
| `threadpup-architecture.excalidraw` | Architecture | Editable Excalidraw | 57 KB |
| `threadpup-architecture-excalidraw.png` | Architecture | PNG (2x) | 341 KB |
| `threadpup-architecture.svg` | Architecture | SVG vector | 46 KB |
| `threadpup-architecture.png` | Architecture | Kie.ai AI-generated | 578 KB |
| `threadpup-journey.excalidraw` | Customer Journey | Editable Excalidraw | 90 KB |
| `threadpup-journey.png` | Customer Journey | PNG (2x) | 453 KB |
| `threadpup-journey.svg` | Customer Journey | SVG vector | 86 KB |

**Total: 7 files, ~1.6 MB**

### Key Lesson: Self-Checking Visual Validation Loop

The most effective workflow was a **render → review → fix** loop: generate the Excalidraw JSON, export to PNG, visually inspect the output for overlapping text, cramped labels, or misaligned arrows, then adjust coordinates and rebuild. This mirrors having a designer review their own work. Each diagram required 2–3 refinement passes before the layout was clean:

- **Architecture diagram:** Return arrow routing and label overlap were the main issues. Increasing spacing between rows and rerouting the dashed arrow solved both.
- **Customer journey:** Phase band visibility and node text size needed adjustment. The wide horizontal format (12 stages) required careful balance between node size and inter-node gaps.

The `.excalidraw` files are fully editable at excalidraw.com — no account needed — for further manual refinement.

Built with Claude Code + Excalidraw + Kie.ai Nano Banana 2

---

## Final Exercise: Client Deliverable

### Overview

This final exercise combined everything learned throughout the project into a single portfolio-ready deliverable across three scenarios. The goal: demonstrate end-to-end AI visual content creation — from scripting to image generation to technical diagramming — as a marketable skill for client work.

**GitHub Portfolio:** [github.com/heviangelotadena/ai-infographics-portfolio](https://github.com/heviangelotadena/ai-infographics-portfolio)

---

### Scenario 1 — YouTube Explainer Pack: "What is an AI Agent?"

**Goal:** Write a 3-minute explainer script and generate 5 infographic frames suitable for a YouTube video at 1920×1080.

**Method:** KIE.ai Nano Banana 2 API (direct REST calls via custom Node.js script)

**Script:** A structured 3-minute explainer covering hook → problem → concept → example → summary, saved as `references/ai-agent-script.md`.

**Visual Style:** Dark navy background (#0f1729), electric blue accents, warm coral highlights, mint green checkmarks. Excalidraw hand-drawn aesthetic with sketchy line-art. All frames maintain broadcast-scale legible typography.

**5 Frames Generated:**

| Frame | File | Content |
|-------|------|---------|
| 1 — Hook | `generated/youtube-ai-agent/frame-01-hook.png` | Title card with robot brain, orbiting tool icons (search, gear, lightning), "PART 1 OF 5" badge |
| 2 — Problem | `generated/youtube-ai-agent/frame-02-problem.png` | Two-column pain points: frustrated user with X-marked bullets vs. limitation wall blocking a goal |
| 3 — Concept | `generated/youtube-ai-agent/frame-03-concept.png` | Agent Core architecture: Memory → Reasoning → Action with surrounding tools and OBSERVE→PLAN→ACT→REPEAT loop |
| 4 — Example | `generated/youtube-ai-agent/frame-04-example.png` | 4-step research agent walkthrough with annotation bubbles ("Uses Google Search 6 times", "Reads 12 articles") |
| 5 — Summary | `generated/youtube-ai-agent/frame-05-summary.png` | 5 stacked takeaway cards with checkmarks + subscribe CTA |

**Resolution:** 2K, 16:9 landscape aspect ratio

**Key Decision:** The Gemini API free tier was exhausted (quota limit: 0 across all image models), so a custom KIE.ai REST API script (`src/kie-generate.js`) was built as an alternative. This script handles task creation, polling with retry logic, and image download — and is reusable for future projects.

---

### Scenario 2 — Technical Documentation Set (ThreadPup)

**Goal:** Create 3 professional diagrams using the Excalidraw programmatic pipeline (Method B), exported as `.excalidraw` + `.png` + `.svg`.

**Method:** Node.js scripts generating Excalidraw JSON → headless PNG/SVG export via `excalidraw-brute-export-cli`

**3 Diagrams:**

#### 1. System Architecture (Polished)

- **File:** `generated/threadpup-architecture-excalidraw.png`
- **Script:** `src/build-architecture.js`
- **What changed:** Added a tech-stack pill row (Next.js, Supabase, Stripe, Resend, Vercel) below the title. Widened the canvas from 1060px → 1140px to reduce email sidebar crowding. Shifted main flow and sidebar centers for better spacing.
- **Content:** Customer Browser → Next.js Storefront → Supabase/Stripe (split row) → Fulfillment API → Print Shop, with Resend email notification sidebar and color-coded legend.

#### 2. Deployment Pipeline (New)

- **File:** `generated/threadpup-deployment.png`
- **Script:** `src/build-deployment.js` (new file)
- **Content:** Developer → GitHub Repository → Vercel Build Pipeline (4 internal steps: Install Dependencies, Linting & Type Check, Tests, Build Next.js) → Vercel Edge Network → Production Site. Lavender sidebar showing branch environments: `main` → Production, `staging` → Preview, `feature/*` → Preview (auto).
- **Color coding:** Blue for developer/app, green for CI/CD infrastructure, lavender for branch environments.

#### 3. Customer Order Data Flow (New)

- **File:** `generated/threadpup-data-flow.png`
- **Script:** `src/build-data-flow.js` (new file)
- **Content:** 9-step end-to-end flow from Browse Catalog to Delivery. Each step shows the API endpoint or action, with a lavender "Data Stores" sidebar showing which Supabase tables are touched at each stage (products, cart_items, orders, payments, fulfillment_jobs, shipments). Phase labels on the left margin group steps into CUSTOMER, BACKEND, and SHIPPING phases.
- **Arrow labels:** Each connecting arrow is annotated with the data payload that moves between services (e.g., "order + payment intent", "tracking number").

**All 3 diagrams** are editable at excalidraw.com by opening the `.excalidraw` files.

---

### Scenario 3 — Social Media Content Kit (ThreadPup LinkedIn)

**Goal:** Generate a week's worth of LinkedIn visual content (5 posts) with consistent ThreadPup branding.

**Method:** KIE.ai Nano Banana 2 API via `src/kie-generate.js`

**Visual Style:** Warm peach background (#fdf4ec), ThreadPup brand colors (sage green, sky blue, warm orange, lavender), hand-drawn Excalidraw aesthetic, paw print branding, portrait 4:5 for LinkedIn feed optimization.

**5 Posts Generated:**

| Post | File | Content |
|------|------|---------|
| 1 — What We Do | `generated/threadpup-linkedin/post-01-what-we-do.png` | "MEET THREADPUP" intro with golden retriever wearing custom tee, surrounded by product sketches (t-shirt, tote, mug) |
| 2 — How It Works | `generated/threadpup-linkedin/post-02-how-it-works.png` | 4-step flow: Pick breed → Choose design → Print & ship → Your pup goes famous |
| 3 — AI Automation | `generated/threadpup-linkedin/post-03-ai-automation.png` | Checklist of what AI handles + mini architecture diagram (Customer → ThreadPup → AI Art/Print/Email) |
| 4 — Cost Savings | `generated/threadpup-linkedin/post-04-cost-savings.png` | "Old Way" (warehouse, red X) vs "ThreadPup Way" (print one, green check) vs "The Result" (growing chart) |
| 5 — Get Started | `generated/threadpup-linkedin/post-05-get-started.png` | Rocket launch CTA with benefit pills + "START YOUR STORE TODAY" call-to-action |

**Resolution:** 2K, 4:5 portrait aspect ratio (optimal for LinkedIn feed)

**Brand Consistency:** All 5 posts share the same ThreadPup wordmark placement (top-left), color palette, hand-drawn line style, and warm peach background — creating a cohesive social media presence.

---

### New Files Created in This Exercise

| File | Purpose |
|------|---------|
| `src/build-deployment.js` | Deployment pipeline diagram builder (Excalidraw) |
| `src/build-data-flow.js` | Customer order data flow diagram builder (Excalidraw) |
| `src/kie-generate.js` | Reusable KIE.ai API image generation script (Node.js) |
| `references/ai-agent-script.md` | 3-minute YouTube explainer script for "What is an AI Agent?" |

### Tools & APIs Used

| Tool | Role |
|------|------|
| Claude Code (Opus 4.6) | Orchestration, code generation, prompt crafting, visual review |
| KIE.ai Nano Banana 2 | AI image generation (10 images across Scenarios 1 & 3) |
| Excalidraw JSON + brute-export-cli | Programmatic diagram generation (3 diagrams in Scenario 2) |
| Gemini 2.5 Flash | Content summarization (used in earlier pipeline stages) |
| Node.js (ESM) | All scripts and automation |

### Lessons Learned

1. **API fallback strategy matters.** When the Gemini free tier was exhausted, having the KIE.ai API key as a backup — and building a reusable script for it — kept the project moving. Always have a Plan B for external API dependencies.

2. **Style anchor blocks ensure consistency.** Repeating the exact same color palette hex codes and style constraints verbatim across all prompts in a set (rather than paraphrasing) produced visually cohesive image sets.

3. **Programmatic diagrams vs. AI images serve different needs.** Excalidraw diagrams are editable, precise, and reproducible — ideal for technical documentation. AI-generated images are visually richer and faster to produce — ideal for marketing content. A client deliverable benefits from using both.

4. **Polling APIs need resilience.** The KIE.ai API queue times varied from 45 seconds to 6+ minutes. The script needed retry logic for network failures and generous timeouts to handle queue variability.

5. **Portfolio presentation is part of the deliverable.** Initializing a proper git repo with `.gitignore` (excluding `.env` secrets), structured commits, and a public GitHub URL turns project files into a professional portfolio piece.

Built with Claude Code + KIE.ai Nano Banana 2 + Excalidraw
