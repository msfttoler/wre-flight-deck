import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { readStaticFile, themeScriptHash } from '../src/assets.mjs';
import { repo } from './helpers.mjs';

async function fixture(t) {
  const directory = await fs.mkdtemp(join(repo, '.test-data-assets-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

test('static file reads reject symbolic links and non-regular files', async t => {
  const directory = await fixture(t);
  const target = join(directory, 'private.json');
  const link = join(directory, 'app.js');
  await fs.writeFile(target, 'private state must not be served');
  await fs.symlink(target, link);
  await assert.rejects(readStaticFile(link), { code: 'ELOOP' });
  await assert.rejects(readStaticFile(directory), { status: 404, code: 'NOT_FOUND' });
  await assert.rejects(readStaticFile(join(directory, 'missing.js')), { code: 'ENOENT' });
});

test('a path replaced with a symlink after open cannot redirect the descriptor read', async t => {
  const directory = await fixture(t);
  const asset = join(directory, 'app.js');
  const original = join(directory, 'original.js');
  const privateFile = join(directory, 'private.json');
  await fs.writeFile(asset, 'approved asset bytes');
  await fs.writeFile(privateFile, 'private state must not be served');
  const open = fs.open;
  let descriptor;
  t.mock.method(fs, 'open', async (...args) => {
    descriptor = await open(...args);
    await fs.rename(asset, original);
    await fs.symlink(privateFile, asset);
    return descriptor;
  });
  assert.equal((await readStaticFile(asset)).toString(), 'approved asset bytes');
  assert.equal(descriptor.fd, -1, 'The descriptor is closed after reading.');
  t.mock.restoreAll();
  await assert.rejects(readStaticFile(asset), { code: 'ELOOP' });
});

test('static descriptor is closed even when its type check rejects a directory', async t => {
  const directory = await fixture(t);
  const open = fs.open;
  let descriptor;
  t.mock.method(fs, 'open', async (...args) => {
    descriptor = await open(...args);
    return descriptor;
  });
  await assert.rejects(readStaticFile(directory), { status: 404 });
  assert.equal(descriptor.fd, -1);
});

test('theme CSP hash preserves the exact inline bytes, including boundary whitespace', () => {
  const script = '\n    document.documentElement.dataset.theme = "dark";\n  ';
  const html = `<head><script>${script}</script><script>otherCode()</script></head>`;
  const expected = `sha256-${createHash('sha256').update(script).digest('base64')}`;
  assert.equal(themeScriptHash(html), expected);
  assert.notEqual(themeScriptHash(html),
    `sha256-${createHash('sha256').update(script.trim()).digest('base64')}`);
});

test('theme marker handling fails closed on absent, incomplete, attributed, or misleading tags', () => {
  for (const html of [
    '<head></head>', '<script>unfinished', '<script> \n </script>',
    '<scripture>not a script</scripture>',
    '<script src="/app.js"></script>', '<script type="module">otherCode()</script>',
    '<SCRIPT>otherCode()</SCRIPT>', '<script>otherCode()</script >',
  ]) {
    assert.equal(themeScriptHash(html), undefined, html);
  }
});
