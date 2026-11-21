import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ENTRY = `Your mother's hand is on your forehead, weighing nothing.
It has been there, on and off, all night.
The rain goes over the roof
in long soft passes,
and the town turns in its sleep.
By morning your skin will be cool
and she will be asleep in the chair
and the rain elsewhere.`;

const MAX_CODE_POINTS = 280;

async function writeEntry(dir: string): Promise<string> {
  const entryPath = join(dir, 'entry.txt');
  await mkdir(dir, { recursive: true });
  await writeFile(entryPath, ENTRY, { encoding: 'utf8' });
  return entryPath;
}

async function verifyEntry(path: string): Promise<void> {
  const bytes = await readFile(path);

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

async function main(): Promise<void> {
  const outputDir = process.env.OUTPUT_DIR ?? '/output';
  const entryPath = await writeEntry(outputDir);
  await verifyEntry(entryPath);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
