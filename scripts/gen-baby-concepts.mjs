/**
 * Generate cute + meme baby concepts via fal.ai (text-to-image).
 *
 * Setup:
 *   1. Get a key at https://fal.ai/dashboard/keys
 *   2. PowerShell:  $env:FAL_KEY = "your-key"
 *   3. node scripts/gen-baby-concepts.mjs
 *
 * Images are saved to public/baby-concepts/.
 * Uses Nano Banana 2 (fast/cheap) — swap MODEL to nano-banana-pro for finals.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.FAL_KEY;
if (!KEY) {
  console.error('✗ FAL_KEY not set. PowerShell:  $env:FAL_KEY = "your-key"');
  process.exit(1);
}

const MODEL = 'fal-ai/nano-banana-2'; // cheap drafts; nano-banana-pro for finals
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'baby-concepts');

const CONCEPTS = [
  {
    name: '1-cute-kewpie',
    image_size: 'square',
    prompt:
      'adorable chibi newborn baby mascot, soft pastel peach skin, big round head, ' +
      'closed happy eyes (^_^), rosy cheeks, tiny smile, a single curl of hair, curled up and ' +
      'floating peacefully, clean soft 3D render, Pixar/kawaii style, gentle studio lighting, ' +
      'plain off-white background, product render',
  },
  {
    name: '2-womb-orb',
    image_size: 'square',
    prompt:
      'cute 3D kawaii baby floating inside a glowing translucent mint-teal bubble (womb orb), ' +
      'tiny sparkles, soft volumetric light, holding a tiny mechanical keyboard, ' +
      'pastel palette with teal #1D9E75 accent, clean render, plain background',
  },
  {
    name: '3-meme-shipit',
    image_size: 'square',
    prompt:
      'funny meme-style cartoon baby developer typing on a tiny laptop at 2am, exaggerated ' +
      'determined face, mug of coffee, "ship it" energy, bold thick outlines, flat sticker ' +
      'illustration, vibrant, white background',
  },
  {
    name: '4-size-gag',
    image_size: 'landscape_4_3',
    prompt:
      'cute cartoon baby next to a full-size mechanical keyboard for a playful size comparison, ' +
      'flat vector infographic style, soft pastel colors, clean labels area, white background, ' +
      'social share card vibe',
  },
];

async function run(c) {
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: c.prompt, image_size: c.image_size, num_images: 1 }),
  });
  if (!res.ok) {
    console.error(`✗ ${c.name}: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    return;
  }
  const data = await res.json();
  const url = data.images?.[0]?.url ?? data.image?.url;
  if (!url) {
    console.error(`✗ ${c.name}: no image in response — ${JSON.stringify(data).slice(0, 200)}`);
    return;
  }
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  const file = join(OUT, `${c.name}.png`);
  await writeFile(file, bytes);
  console.log(`✓ ${c.name} → ${file}`);
}

await mkdir(OUT, { recursive: true });
console.log(`Generating ${CONCEPTS.length} concepts with ${MODEL}…`);
for (const c of CONCEPTS) await run(c);
console.log('Done. Open public/baby-concepts/ to compare.');
