import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

test('generated client bundle registers a factory whose return value exports apply', async () => {
  const { registrations } = await loadBundle();

  assert.equal(registrations.length, 1);
  assert.equal(registrations[0].id, 'dsh-mobile-ux');
  const exports = registrations[0].factory(() => {
    throw new Error('the apply export should not require another module');
  });
  assert.equal(typeof exports.apply, 'function');
});

test('client apply injects one compatible style for repeated calls', async () => {
  const { context, document, registrations } = await loadBundle({ compatible: true });
  const exports = registrations[0].factory(() => {});

  exports.apply();
  exports.apply();

  assert.equal(document.head.appended.length, 1);
  assert.match(document.head.appended[0].textContent, /grid-template-columns: 0 minmax\(0, 1fr\) 0/);
  assert.equal(context.__DSH_MOBILE_UX__.state, 'compatible');
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.ok, true);
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.layout, true);
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.conversation, true);
});

test('client apply fails closed without compatible hooks', async () => {
  const { context, document, registrations } = await loadBundle({ compatible: false });
  const exports = registrations[0].factory(() => {});

  exports.apply();

  assert.equal(document.head.appended.length, 0);
  assert.equal(context.__DSH_MOBILE_UX__.state, 'incompatible');
});

test('client binds PWA sidebar swipes to the existing toggle', async () => {
  const { document, frame, sidebarContent, toggle, registrations } = await loadBundle({
    compatible: true,
    pwaMode: 'standalone'
  });
  const exports = registrations[0].factory(() => {});

  exports.apply();

  assert.deepEqual(document.listenerTypes(), ['touchcancel', 'touchend', 'touchmove', 'touchstart']);
  assert.ok(document.listenersArePassive());

  const event = (x, y, target = document.body) => ({
    touches: [{ clientX: x, clientY: y }],
    target,
    preventDefault() {
      throw new Error('sidebar gesture must not cancel the browser gesture');
    }
  });

  document.dispatch('touchstart', event(16, 100));
  document.dispatch('touchmove', event(64, 140));
  assert.equal(toggle.clicks, 1);

  frame.collapsed = false;
  document.dispatch('touchend', { touches: [] });
  document.dispatch('touchstart', event(140, 100, sidebarContent));
  document.dispatch('touchmove', event(92, 148, sidebarContent));
  assert.equal(toggle.clicks, 2);
});

test('client keeps PWA sidebar gestures out of browser tabs and unrelated touches', async () => {
  const browserTab = await loadBundle({ compatible: true });
  const browserExports = browserTab.registrations[0].factory(() => {});
  browserExports.apply();
  assert.deepEqual(browserTab.document.listenerTypes(), []);

  const pwa = await loadBundle({ compatible: true, pwaMode: 'ios' });
  const exports = pwa.registrations[0].factory(() => {});
  exports.apply();
  const event = (x, y, target = pwa.document.body) => ({
    touches: [{ clientX: x, clientY: y }],
    target
  });

  pwa.document.dispatch('touchstart', event(65, 100));
  pwa.document.dispatch('touchmove', event(113, 100));
  pwa.document.dispatch('touchend', { touches: [] });

  pwa.document.dispatch('touchstart', event(16, 100));
  pwa.document.dispatch('touchmove', event(64, 149));
  pwa.document.dispatch('touchend', { touches: [] });

  assert.equal(pwa.toggle.clicks, 0);

  pwa.frame.collapsed = false;
  pwa.document.dispatch('touchstart', event(140, 100));
  pwa.document.dispatch('touchmove', event(92, 100));
  pwa.document.dispatch('touchend', { touches: [] });
  assert.equal(pwa.toggle.clicks, 0);
});

async function loadBundle({ compatible = false, pwaMode = 'none' } = {}) {
  const bundle = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  const fake = createFakeDocument(compatible);
  const registrations = [];
  const context = {
    document: fake.document,
    clearTimeout() {},
    setTimeout() { return 1; },
    window: {
      __ModuleLoader__: {
        load(record) {
          registrations.push(record);
        }
      }
    }
  };
  if (pwaMode === 'standalone') {
    context.matchMedia = (query) => ({ matches: query === '(display-mode: standalone)' });
  }
  if (pwaMode === 'ios') context.navigator = { standalone: true };
  if (compatible) context.MutationObserver = FakeMutationObserver;
  vm.runInNewContext(bundle, context);
  return { context, ...fake, registrations };
}

function createFakeDocument(compatible) {
  const selectors = compatible
    ? new Set([
      '[class$="_frame"]',
      '[class$="_sidebarCol"]',
      '[class$="_centerCol"]',
      '[data-conversation-scroll]',
      '[data-composer-seat]'
    ])
    : new Set();
  const listeners = new Map();
  const body = {};
  const sidebarContent = {};
  const toggle = {
    clicks: 0,
    click() {
      this.clicks += 1;
    }
  };
  const sidebar = {
    querySelector(selector) {
      return selector === '[class*="_toggle"]' ? toggle : null;
    },
    contains(node) {
      return node === sidebarContent || node === toggle;
    },
    getBoundingClientRect() {
      return { left: 0, right: 280 };
    }
  };
  const frame = {
    collapsed: true,
    hasAttribute(name) {
      return name === 'data-sidebar-collapsed' && this.collapsed;
    },
    querySelector(selector) {
      return selector === '[class$="_sidebarCol"]' ? sidebar : null;
    }
  };
  const head = {
    appended: [],
    appendChild(node) {
      node.parentNode = head;
      head.appended.push(node);
    },
    querySelector() {
      return head.appended[0] ?? null;
    }
  };
  const document = {
    body,
    head,
    documentElement: {},
    createElement() {
      return {
        dataset: {},
        parentNode: null,
        textContent: '',
        remove() {
          const index = head.appended.indexOf(this);
          if (index >= 0) head.appended.splice(index, 1);
        }
      };
    },
    querySelector(selector) {
      if (!selectors.has(selector)) return null;
      if (selector === '[class$="_frame"]') return frame;
      if (selector === '[class$="_sidebarCol"]') return sidebar;
      return {};
    },
    querySelectorAll(selector) {
      return [];
    },
    addEventListener(type, listener, options) {
      listeners.set(type, { listener, passive: options?.passive === true });
    },
    removeEventListener(type, listener) {
      if (listeners.get(type)?.listener === listener) listeners.delete(type);
    },
    dispatch(type, event) {
      listeners.get(type)?.listener(event);
    },
    listenerTypes() {
      return [...listeners.keys()].sort();
    },
    listenersArePassive() {
      return [...listeners.values()].every(({ passive }) => passive);
    }
  };
  return { document, frame, sidebarContent, toggle };
}

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {}

  disconnect() {}
}
