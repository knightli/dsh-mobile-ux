#!/usr/bin/env node
import { build } from '../scripts/build.mjs';
import { check } from '../scripts/check.mjs';
import { loadTarget, loadTargets } from '../src/targets.mjs';
import { install, status, uninstall } from '../src/profile.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { command, options } = parseArgs(process.argv.slice(2));

try {
  const result = await run(command, options);
  if (result !== undefined) print(result, options.json);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function run(name, options) {
  if (name === 'build') return build();
  if (name === 'check') {
    return check({
      dshHome: options.dshHome,
      profile: options.profile,
      artifactRoot: options.artifactRoot,
      sourceRoot: options.sourceRoot ?? ROOT
    });
  }
  if (name === 'targets') return loadTargets();
  if (['install', 'status', 'uninstall'].includes(name)) {
    const target = await loadTarget();
    const common = {
      dshHome: options.dshHome,
      profile: options.profile,
      artifactRoot: options.artifactRoot,
      sourceRoot: options.sourceRoot ?? ROOT
    };
    if (name === 'install') return install(target, common);
    if (name === 'uninstall') return uninstall(target, common);
    return status(target, common);
  }
  throw new Error('Usage: dsh-mobile-ux <build|check|install|status|uninstall> [--dsh-home <path>] [--profile <name>]');
}

function parseArgs(args) {
  const [command = 'help', ...rest] = args;
  const options = { json: false };
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--json') {
      options.json = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`Unknown argument: ${token}`);
    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = rest[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

function print(value, json) {
  if (json || typeof value !== 'object') {
    console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}
