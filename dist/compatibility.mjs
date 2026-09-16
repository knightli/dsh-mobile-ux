import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const GENERATED_CLASS_SELECTOR = /\.[A-Za-z0-9]{5,12}_[A-Za-z0-9_-]+/;

export async function inspectPluginArtifact(root) {
  const checks = [];
  const packagePath = join(root, 'package.json');
  const cssPath = join(root, 'styles', 'mobile.css');
  const clientPath = join(root, 'dist', 'client.js');

  let manifest;
  let css = '';
  let client = '';

  try {
    manifest = JSON.parse(await readFile(packagePath, 'utf8'));
    checks.push({ id: 'package-json', ok: manifest.name === 'dsh-mobile-ux' });
  } catch (error) {
    checks.push({ id: 'package-json', ok: false, detail: error.message });
  }

  try {
    css = await readFile(cssPath, 'utf8');
    checks.push({
      id: 'mobile-css',
      ok: requiredCssTokens().every((token) => css.includes(token)) &&
        !GENERATED_CLASS_SELECTOR.test(css) &&
        !css.includes('@media (min-width')
    });
  } catch (error) {
    checks.push({ id: 'mobile-css', ok: false, detail: error.message });
  }

  try {
    client = await readFile(clientPath, 'utf8');
    checks.push({
      id: 'client-entry',
      ok: client.includes('window.__ModuleLoader__.load') &&
        client.includes('data-dsh-mobile-ux-style') &&
        client.includes('data-sidebar-collapsed')
    });
  } catch (error) {
    checks.push({ id: 'client-entry', ok: false, detail: error.message });
  }

  const clientDeclaration = manifest?.dsh?.client;
  checks.push({
    id: 'client-declaration',
    ok: clientDeclaration?.platform === 'web' && clientDeclaration?.immediately === true
  });
  checks.push({
    id: 'client-export',
    ok: manifest?.exports?.['./client'] === './dist/client.js'
  });

  return {
    kind: 'plugin',
    root,
    ok: checks.every((check) => check.ok),
    checks
  };
}

export async function inspectTargetArtifacts(target, artifactRoot) {
  const checks = [];
  for (const artifact of target.compatibility.artifacts) {
    const path = join(artifactRoot, ...artifact.path);
    try {
      const source = await readFile(path, 'utf8');
      const missing = artifact.tokens.filter((token) => !source.includes(token));
      checks.push({
        id: artifact.id,
        path,
        ok: missing.length === 0,
        missing
      });
    } catch (error) {
      checks.push({ id: artifact.id, path, ok: false, missing: artifact.tokens, detail: error.message });
    }
  }
  return {
    kind: 'target',
    target: target.id,
    artifactRoot,
    ok: checks.every((check) => check.ok),
    checks
  };
}

export function formatCompatibilityFailure(...reports) {
  const failures = reports.flatMap((report) => report.checks.filter((check) => !check.ok));
  if (failures.length === 0) return '';
  return failures.map((failure) => {
    const detail = failure.missing?.length
      ? ` missing: ${failure.missing.join(', ')}`
      : failure.detail
        ? ` (${failure.detail})`
        : '';
    return `${failure.id}${detail}`;
  }).join('; ');
}

function requiredCssTokens() {
  return [
    '[class$="_frame"]',
    'grid-template-columns: 0 minmax(0, 1fr) 0',
    '[class$="_sidebarCol"]',
    '[data-sidebar-collapsed]',
    '[class$="_sessionLogButton"]',
    '[class$="_header"]',
    '[class$="_titleRow"]',
    '[class$="_titleCluster"]',
    '[class$="_headerUtilities"]',
    '[class$="_headerActions"]',
    '[class$="_tabs"]',
    '[class*="_collapsed"]',
    '[class*="_logoRow"]',
    '[class*="_iconButton"]',
    '[class*="_toggle"]',
    '[class*="_railFish"]',
    '[data-conversation-scroll]',
    '[data-composer-seat]',
    '[data-composer-card]',
    'safe-area-inset-bottom',
    '100dvh'
  ];
}
