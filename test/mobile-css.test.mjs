import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const css = await readFile(new URL('../styles/mobile.css', import.meta.url), 'utf8');

test('mobile CSS keeps desktop outside the narrow media query and uses semantic hooks', () => {
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(css, /--dsh-mobile-sidebar-width: min\(280px, calc\(100vw - 16px\)\)/);
  assert.match(css, /--dsh-mobile-safe-bottom: env\(safe-area-inset-bottom, 0px\)/);
  assert.match(css, /--dsh-mobile-viewport-height: 100dvh/);
  assert.match(css, /width: var\(--dsh-mobile-sidebar-width\) !important/);
  assert.match(css, /inset-inline-start: var\(--dsh-mobile-sidebar-width\)/);
  assert.match(css, /grid-template-columns: 0 minmax\(0, 1fr\) 0/);
  assert.match(css, /\[class\$="_frame"\]/);
  assert.match(css, /\[class\$="_sidebarCol"\]/);
  assert.match(css, /\[class\$="_sessionLogButton"\] span/);
  assert.match(css, /\[class\$="_sessionLogButton"\] svg/);
  assert.match(css, /\[data-sidebar-collapsed\]/);
  assert.match(css, /inset-inline-start: 8px/);
  assert.match(css, /\[class\$="_header"\]/);
  assert.match(css, /\[class\$="_titleRow"\]/);
  assert.match(css, /\[class\$="_titleCluster"\]/);
  assert.match(css, /\[class\$="_headerUtilities"\]/);
  assert.match(css, /\[class\$="_headerActions"\]/);
  assert.match(css, /\[data-desktop-status\]/);
  assert.match(css, /\[data-conversation-scroll\]/);
  assert.match(css, /\[data-conversation-scroll\] \[class\$="_scroll"\]/);
  assert.match(css, /padding: 12px 12px 76px/);
  assert.match(css, /\[data-composer-seat\]/);
  assert.match(css, /padding-block-end: max\(8px, var\(--dsh-mobile-safe-bottom\)\)/);
  assert.match(css, /max-block-size: calc\(var\(--dsh-mobile-viewport-height\) - var\(--dsh-mobile-safe-bottom\)\)/);
  assert.doesNotMatch(css, /\.[A-Za-z0-9]{5,12}_[A-Za-z0-9_-]+/);
  assert.doesNotMatch(css, /@media \(min-width/);
});
