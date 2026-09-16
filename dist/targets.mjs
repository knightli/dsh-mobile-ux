import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_ROOT = join(SOURCE_ROOT, 'targets');
const TARGET_ID = 'dsh-web';

export const TARGET_IDS = Object.freeze([TARGET_ID]);

export function targetManifestPath(id = TARGET_ID) {
  if (id !== TARGET_ID) throw new Error(`Unknown target: ${id}`);
  return join(TARGET_ROOT, 'dsh-web.json');
}

export async function loadTarget(id = TARGET_ID) {
  const manifest = JSON.parse(await readFile(targetManifestPath(id), 'utf8'));
  validateTarget(manifest, id);
  return manifest;
}

export async function loadTargets() {
  return Promise.all(TARGET_IDS.map((id) => loadTarget(id)));
}

function validateTarget(target, requestedId) {
  if (!target || target.schemaVersion !== 1 || target.id !== requestedId) {
    throw new Error(`Invalid target manifest: ${requestedId}`);
  }
  if (target.patch?.scope !== 'home' || target.patch?.survivesProfileRewrite !== true) {
    throw new Error(`Target ${requestedId} must use a persistent home patch`);
  }
  if (target.profile?.defaultName !== 'web' || !Array.isArray(target.profile.rootRelative) ||
      !Array.isArray(target.profile.moduleDirectoryRelative)) {
    throw new Error(`Target ${requestedId} must describe a web profile`);
  }
  if (!Array.isArray(target.compatibility?.artifacts) || target.compatibility.artifacts.length === 0) {
    throw new Error(`Target ${requestedId} has no compatibility artifacts`);
  }
}
