export { createClientBundle } from './client-runtime.mjs';
export { inspectPluginArtifact, inspectTargetArtifacts, formatCompatibilityFailure } from './compatibility.mjs';
export { loadTarget, loadTargets, TARGET_IDS } from './targets.mjs';
export {
  defaultSourceRoot,
  resolveDshHome,
  resolveTargetPaths,
  install,
  uninstall,
  status
} from './profile.mjs';

// The host half is intentionally inert. The browser half is registered from
// dist/client.js and owns only CSS injection plus compatibility reporting.
export function apply() {}
