import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const css = await readFile(new URL('../styles/mobile.css', import.meta.url), 'utf8');

test('mobile CSS keeps desktop outside the narrow media query and uses semantic hooks', () => {
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(css, /grid-template-columns: 0 minmax\(0, 1fr\) 0/);
  assert.match(css, /\[class\$="_frame"\]/);
  assert.match(css, /\[class\$="_sidebarCol"\]/);
  assert.match(css, /\[data-sidebar-collapsed\]/);
  assert.match(css, /\[data-conversation-scroll\]/);
  assert.match(css, /\[data-composer-seat\]/);
  assert.doesNotMatch(css, /\.[A-Za-z0-9]{5,12}_[A-Za-z0-9_-]+/);
  assert.doesNotMatch(css, /@media \(min-width/);
});
