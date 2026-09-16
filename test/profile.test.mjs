import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { install, resolveDshHome, resolveTargetPaths, status, uninstall } from '../src/profile.mjs';
import { loadTarget } from '../src/targets.mjs';

test('generic web profile resolves its home and persists in the home patch', async () => {
  const target = await loadTarget();
  const home = await mkdtemp(join(tmpdir(), 'dsh-mobile-ux-profile-'));
  try {
    const artifactRoot = join(home, 'profiles', 'node_modules');
    await writeTargetArtifacts(artifactRoot, target);
    const resolved = resolveDshHome(target, { dshHome: home });
    assert.equal(resolved, home);
    assert.throws(() => resolveTargetPaths(target, { dshHome: home, profile: '..' }), /Invalid DSH profile name/);

    const installed = await install(target, { dshHome: home, profile: 'web' });
    assert.equal(installed.active, true);
    const patch = await readFile(join(home, 'cordis.patch.yml'), 'utf8');
    assert.match(patch, /dsh-mobile-ux: BEGIN MANAGED ENTRY/);
    assert.equal(installed.persistence, true);

    await mkdir(join(home, 'profiles', 'web'), { recursive: true });
    await writeFile(join(home, 'profiles', 'web', 'cordis.patch.yml'), '- id: launcher-owned\n', 'utf8');
    const repeated = await install(target, { dshHome: home, profile: 'web' });
    assert.equal(repeated.active, true);
    assert.equal(await readFile(join(home, 'profiles', 'web', 'cordis.patch.yml'), 'utf8'), '- id: launcher-owned\n');

    const removed = await uninstall(target, { dshHome: home, profile: 'web' });
    assert.equal(removed.active, false);
    assert.doesNotMatch(await readFile(join(home, 'cordis.patch.yml'), 'utf8'), /BEGIN MANAGED ENTRY/);
    assert.equal((await status(target, { dshHome: home, profile: 'web' })).link.present, false);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test('installation fails closed before writing when target artifacts are absent', async () => {
  const target = await loadTarget();
  const home = await mkdtemp(join(tmpdir(), 'dsh-mobile-ux-fail-closed-'));
  try {
    await assert.rejects(
      install(target, { dshHome: home }),
      /Compatibility check failed; no profile changes were written/
    );
    assert.equal(await exists(join(home, 'cordis.patch.yml')), false);
    assert.equal(await exists(join(home, 'profiles', 'node_modules', 'dsh-mobile-ux')), false);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

async function writeTargetArtifacts(root, target) {
  for (const artifact of target.compatibility.artifacts) {
    const path = join(root, ...artifact.path);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, artifact.tokens.join('\n'), 'utf8');
  }
}

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    return error.code !== 'ENOENT';
  }
}
