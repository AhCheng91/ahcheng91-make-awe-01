import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ENTRY = `The air is on the roof tonight.
It is on the field and the pond,
on the heron standing asleep in the shallows.
It weighs the same on all of it,
and has since long before the house.
The roof does not creak under it.
The heron sleeps on one leg
and does not fall.`;

const MAX_CODE_POINTS = 280;

async function main(): Promise<void> {
  const outputDir = process.env.OUTPUT_DIR ?? '/output';
  const entryPath = join(outputDir, 'entry.txt');

  await mkdir(outputDir, { recursive: true });
  await writeFile(entryPath, ENTRY, { encoding: 'utf8' });

  const bytes = await readFile(entryPath);

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('entry.txt does not decode as UTF-8');
  }

  const codePoints = Array.from(text).length;
  if (codePoints < 1 || codePoints > MAX_CODE_POINTS) {
    throw new Error(
      `entry.txt has ${codePoints} code points, expected 1 to ${MAX_CODE_POINTS}`,
    );
  }

  if (text.trim().length === 0) {
    throw new Error('entry.txt is only white space');
  }

  const sha256 = createHash('sha256').update(bytes).digest('hex');
  console.log(`entry.txt: ${codePoints} code points, sha256 ${sha256}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
