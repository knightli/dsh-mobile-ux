import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClientBundle } from '../src/client-runtime.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function build() {
  const css = await readFile(join(ROOT, 'styles', 'mobile.css'), 'utf8');
  const dist = join(ROOT, 'dist');
  await mkdir(dist, { recursive: true });
  await writeFile(join(dist, 'client.js'), createClientBundle(css), 'utf8');
  const moduleFiles = ['index.mjs', 'client-runtime.mjs', 'compatibility.mjs', 'targets.mjs', 'profile.mjs'];
  for (const file of moduleFiles) {
    await writeFile(join(dist, file), await readFile(join(ROOT, 'src', file), 'utf8'), 'utf8');
  }
  await cp(join(ROOT, 'src', 'features'), join(dist, 'features'), { recursive: true });
  return { dist, files: ['client.js', ...moduleFiles] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await build();
}
