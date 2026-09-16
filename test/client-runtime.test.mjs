import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

test('generated client bundle registers a factory whose return value exports apply', async () => {
  const bundle = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  const registrations = [];
  const context = {
    window: {
      __ModuleLoader__: {
        load(record) {
          registrations.push(record);
        }
      }
    }
  };
  vm.runInNewContext(bundle, context);

  assert.equal(registrations.length, 1);
  assert.equal(registrations[0].id, 'dsh-mobile-ux');
  const exports = registrations[0].factory(() => {
    throw new Error('the apply export should not require another module');
  });
  assert.equal(typeof exports.apply, 'function');
});
