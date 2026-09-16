import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectPluginArtifact, inspectTargetArtifacts, formatCompatibilityFailure } from '../src/compatibility.mjs';
import { loadTarget } from '../src/targets.mjs';
import { resolveTargetPaths } from '../src/profile.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function check({ dshHome, profile, artifactRoot, sourceRoot = ROOT } = {}) {
  const plugin = await inspectPluginArtifact(sourceRoot);
  const reports = [plugin];
  const target = await loadTarget();
  if (dshHome || artifactRoot) {
    const paths = resolveTargetPaths(target, { dshHome, profile });
    reports.push(await inspectTargetArtifacts(target, artifactRoot ?? paths.artifactRoot));
  }
  if (reports.some((report) => !report.ok)) {
    throw new Error(`Check failed: ${formatCompatibilityFailure(...reports)}`);
  }
  return {
    ok: true,
    sourceRoot,
    contract: target.id,
    profile: profile ?? target.profile.defaultName,
    reports
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await check();
  console.log(JSON.stringify(result, null, 2));
}
