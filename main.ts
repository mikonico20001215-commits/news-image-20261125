// news-image-20261125 entry (Node 22, standard library only).
// The image is entry.png beside this file; the program copies it to
// /output/entry.png after checking it is a whole PNG within the gate:
// at most 1 MiB and at most 1024 by 1024 pixels.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const bytes = readFileSync(source);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A. The width and height live in the
// IHDR chunk that follows it (bytes 16-23, big-endian).
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(signature)) {
  throw new Error('entry.png is not a PNG file');
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB gate`);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
// Read the copy back: the two runs must write the same bytes, so refuse
// to report success if the copy on disk differs from the source.
if (!readFileSync(target).equals(bytes)) {
  throw new Error('entry.png copy differs from the source image');
}
console.log(`news image: wrote ${target} (${width}x${height}, ${statSync(target).size} bytes)`);
