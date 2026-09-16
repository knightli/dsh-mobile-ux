import { homedir } from 'node:os';
import { readFile, lstat, mkdir, realpath, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectPluginArtifact, inspectTargetArtifacts, formatCompatibilityFailure } from './compatibility.mjs';

const SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANAGED_BEGIN = '# dsh-mobile-ux: BEGIN MANAGED ENTRY';
const MANAGED_END = '# dsh-mobile-ux: END MANAGED ENTRY';
const MANAGED_BLOCK = [
  MANAGED_BEGIN,
  '- insert:',
  '    - id: dsh-mobile-ux',
  "      name: 'dsh-mobile-ux'",
  MANAGED_END
].join('\n');
const MANAGED_BLOCK_PATTERN = /^# dsh-mobile-ux: BEGIN MANAGED ENTRY\r?\n[\s\S]*?^# dsh-mobile-ux: END MANAGED ENTRY\r?$/m;

export function defaultSourceRoot() {
  return SOURCE_ROOT;
}

export function resolveDshHome(target, options = {}) {
  if (options.dshHome) return resolve(options.dshHome);
  const env = options.env ?? process.env;
  const userHome = options.homeDir ?? homedir();
  return resolve(env.DSH_HOME || join(userHome, '.dsh'));
}

export function resolveTargetPaths(target, options = {}) {
  const home = resolveDshHome(target, options);
  const profileName = options.profile ?? target.profile.defaultName;
  if (typeof profileName !== 'string' || !/^[A-Za-z0-9._-]+$/.test(profileName) || profileName === '.' || profileName === '..') {
    throw new Error(`Invalid DSH profile name: ${profileName}`);
  }
  const profileDir = join(home, ...target.profile.rootRelative, profileName);
  const artifactRoot = join(home, ...target.profile.moduleDirectoryRelative);
  return {
    home,
    profileName,
    profileDir,
    artifactRoot,
    patchPath: join(home, ...target.patch.relative),
    packageLink: join(artifactRoot, 'dsh-mobile-ux')
  };
}

export async function install(target, options = {}) {
  const sourceRoot = resolve(options.sourceRoot ?? SOURCE_ROOT);
  const paths = resolveTargetPaths(target, options);
  const pluginReport = await inspectPluginArtifact(sourceRoot);
  const targetReport = await inspectTargetArtifacts(target, options.artifactRoot ?? paths.artifactRoot);
  if (!pluginReport.ok || !targetReport.ok) {
    throw new Error(`Compatibility check failed; no profile changes were written: ${formatCompatibilityFailure(pluginReport, targetReport)}`);
  }

  const beforePatch = await readFileState(paths.patchPath);
  const mergedPatch = upsertManagedPatch(beforePatch.content);
  let patchWritten = false;
  let linkCreated = false;

  try {
    if (mergedPatch !== beforePatch.content) {
      await writeAtomic(paths.patchPath, mergedPatch);
      patchWritten = true;
    }
    const linkResult = await ensurePackageLink(paths.packageLink, sourceRoot);
    linkCreated = linkResult.created;
  } catch (error) {
    if (patchWritten) await restoreFileState(paths.patchPath, beforePatch);
    if (linkCreated) await rm(paths.packageLink, { force: true, recursive: false });
    throw error;
  }

  return status(target, { ...options, dshHome: paths.home, sourceRoot });
}

export async function uninstall(target, options = {}) {
  const sourceRoot = resolve(options.sourceRoot ?? SOURCE_ROOT);
  const paths = resolveTargetPaths(target, options);
  const beforePatch = await readFileState(paths.patchPath);
  const link = await linkState(paths.packageLink, sourceRoot);
  const nextPatch = removeManagedPatch(beforePatch.content);
  if (nextPatch !== beforePatch.content) await writeAtomic(paths.patchPath, nextPatch);
  if (link.present && link.matches) await unlink(paths.packageLink);
  return status(target, { ...options, dshHome: paths.home, sourceRoot });
}

export async function status(target, options = {}) {
  const sourceRoot = resolve(options.sourceRoot ?? SOURCE_ROOT);
  const paths = resolveTargetPaths(target, options);
  const targetArtifactRoot = options.artifactRoot ?? paths.artifactRoot;
  const [patch, link, pluginReport, targetReport] = await Promise.all([
    readFileState(paths.patchPath),
    linkState(paths.packageLink, sourceRoot),
    inspectPluginArtifact(sourceRoot),
    inspectTargetArtifacts(target, targetArtifactRoot)
  ]);
  const active = patch.content.includes(MANAGED_BEGIN) && link.present && link.matches;
  return {
    target: target.id,
    home: paths.home,
    profile: paths.profileName,
    profileDir: paths.profileDir,
    artifactRoot: targetArtifactRoot,
    patchPath: paths.patchPath,
    packageLink: paths.packageLink,
    patchManaged: patch.content.includes(MANAGED_BEGIN),
    link,
    compatibility: { plugin: pluginReport, target: targetReport },
    active: Boolean(active && pluginReport.ok && targetReport.ok),
    persistence: target.patch.survivesProfileRewrite
  };
}

function upsertManagedPatch(content) {
  const withoutManaged = content.replace(MANAGED_BLOCK_PATTERN, '').trimEnd();
  if (/^\s*(?:-\s*)?id:\s*dsh-mobile-ux(?:\s|$)/m.test(withoutManaged)) {
    throw new Error('Refusing to overwrite an unmanaged dsh-mobile-ux patch row');
  }
  const match = content.match(MANAGED_BLOCK_PATTERN);
  if (match) {
    return content.slice(0, match.index) + MANAGED_BLOCK + content.slice(match.index + match[0].length);
  }
  if (!content.trim() || content.trim() === '[]') return `${MANAGED_BLOCK}\n`;
  return `${content.trimEnd()}\n${MANAGED_BLOCK}\n`;
}

function removeManagedPatch(content) {
  const match = content.match(MANAGED_BLOCK_PATTERN);
  const withoutManaged = content.replace(MANAGED_BLOCK_PATTERN, '').trim();
  if (!match) {
    if (/^\s*(?:-\s*)?id:\s*dsh-mobile-ux(?:\s|$)/m.test(withoutManaged)) {
      throw new Error('Refusing to remove an unmanaged dsh-mobile-ux patch row');
    }
    return content;
  }
  return withoutManaged ? `${withoutManaged}\n` : '[]\n';
}

async function ensurePackageLink(linkPath, sourceRoot) {
  await mkdir(dirname(linkPath), { recursive: true });
  const current = await linkState(linkPath, sourceRoot);
  if (current.present && current.matches) return { created: false };
  if (current.present) throw new Error(`Refusing to replace existing package path: ${linkPath}`);
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  await symlink(sourceRoot, linkPath, linkType);
  return { created: true };
}

async function linkState(linkPath, sourceRoot) {
  try {
    const info = await lstat(linkPath);
    if (!info.isSymbolicLink()) return { present: true, matches: false, kind: 'directory' };
    const actual = await realpath(linkPath);
    const expected = await realpath(sourceRoot);
    return { present: true, matches: actual === expected, kind: 'link', actual, expected };
  } catch (error) {
    if (error.code === 'ENOENT') return { present: false, matches: false, kind: 'missing' };
    return { present: true, matches: false, kind: 'unreadable', detail: error.message };
  }
}

async function readFileState(path) {
  try {
    return { exists: true, content: await readFile(path, 'utf8') };
  } catch (error) {
    if (error.code === 'ENOENT') return { exists: false, content: '' };
    throw error;
  }
}

async function restoreFileState(path, state) {
  if (state.exists) {
    await writeAtomic(path, state.content);
  } else {
    await rm(path, { force: true });
  }
}

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp-${process.pid}-${Math.random().toString(16).slice(2)}`;
  await writeFile(tempPath, content, 'utf8');
  try {
    await rename(tempPath, path);
  } catch (error) {
    if (!['EEXIST', 'EPERM', 'ENOTEMPTY'].includes(error.code)) {
      await rm(tempPath, { force: true });
      throw error;
    }
    const backupPath = `${path}.bak-${process.pid}-${Math.random().toString(16).slice(2)}`;
    try {
      await rename(path, backupPath);
      await rename(tempPath, path);
      await rm(backupPath, { force: true });
    } catch (fallbackError) {
      await rm(tempPath, { force: true });
      try {
        await rename(backupPath, path);
      } catch {
        // Preserve the original error while leaving any recoverable backup in place.
      }
      throw fallbackError;
    }
  }
}
