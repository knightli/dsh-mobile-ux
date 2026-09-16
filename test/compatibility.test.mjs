import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { inspectPluginArtifact, inspectTargetArtifacts } from '../src/compatibility.mjs';
import { loadTarget } from '../src/targets.mjs';

test('plugin artifact and generic web-profile contract accept semantic hooks', async () => {
  const plugin = await inspectPluginArtifact(fileURLToPath(new URL('..', import.meta.url)));
  assert.equal(plugin.ok, true);

  const root = await mkdtemp(join(tmpdir(), 'dsh-mobile-ux-contract-'));
  try {
    const target = await loadTarget();
    await writeTargetArtifacts(root, target);
    const report = await inspectTargetArtifacts(target, root);
    assert.equal(report.ok, true, JSON.stringify(report));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('target compatibility rejects a missing semantic token', async () => {
  const target = await loadTarget();
  const root = await mkdtemp(join(tmpdir(), 'dsh-mobile-ux-negative-'));
  try {
    await writeTargetArtifacts(root, target);
    const layoutPath = join(root, ...target.compatibility.artifacts[0].path);
    await writeFile(layoutPath, 'data-sidebar-collapsed _frame _sidebarCol _centerCol _handle', 'utf8');
    const report = await inspectTargetArtifacts(target, root);
    assert.equal(report.ok, false);
    assert.deepEqual(report.checks[0].missing, ['_detailsCol']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function writeTargetArtifacts(root, target) {
  for (const artifact of target.compatibility.artifacts) {
    const path = join(root, ...artifact.path);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, artifact.tokens.join('\n'), 'utf8');
  }
}
