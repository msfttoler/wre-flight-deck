import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireThat } from './errors.mjs';

export async function readStaticFile(filename) {
  const handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = await handle.stat();
    requireThat(stat.isFile(), 404, 'NOT_FOUND', 'File not found.');
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

export function themeScriptHash(html) {
  // These are literal boundaries in our own index.html, not an HTML sanitizer or general parser.
  const opening = '<script>';
  const closing = '</script>';
  const start = html.indexOf(opening);
  if (start === -1) return undefined;
  const bodyStart = start + opening.length;
  const end = html.indexOf(closing, bodyStart);
  if (end === -1) return undefined;
  const script = html.slice(bodyStart, end);
  if (!script.trim()) return undefined;
  return `sha256-${createHash('sha256').update(script).digest('base64')}`;
}
