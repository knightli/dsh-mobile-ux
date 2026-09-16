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

test('client shows the bottom refresh prompt and reloads after an armed pull', async () => {
  const { document, frame, conversation, conversationContent, location, registrations } = await loadBundle({
    compatible: true,
    pwaMode: 'standalone'
  });
  const exports = registrations[0].factory(() => {});
  exports.apply();
  exports.configure({ pullRefresh: { animation: 'text' } });

  conversation.scrollTop = 600;
  conversation.clientHeight = 400;
  conversation.scrollHeight = 1000;
  const event = (y) => ({
    touches: [{ clientX: 180, clientY: y }],
    target: conversationContent
  });

  document.dispatch('touchstart', event(500));
  document.dispatch('touchmove', event(465));
  const indicator = document.body.appended[0];
  assert.equal(indicator?.textContent, '继续上拉');
  assert.equal(indicator?.dataset.state, 'pulling');
  assert.equal(location.reloads, 0);

  document.dispatch('touchmove', event(392));
  assert.equal(indicator?.dataset.state, 'pulling');
  document.dispatch('touchend', { touches: [] });
  assert.equal(location.reloads, 0);

  document.dispatch('touchstart', event(500));
  document.dispatch('touchmove', event(285));
  const secondIndicator = document.body.appended[0];
  assert.equal(secondIndicator?.dataset.state, 'pulling');
  document.dispatch('touchmove', event(284));
  assert.equal(secondIndicator?.dataset.state, 'armed');
  document.dispatch('touchend', { touches: [] });
  assert.equal(location.reloads, 1);
  assert.equal(secondIndicator.parentNode, document.body);
  assert.equal(secondIndicator.textContent, '正在刷新…');
  assert.equal(secondIndicator.dataset.state, 'refreshing');
});

test('client retracts the bottom refresh prompt when the pull returns to the bottom', async () => {
  const { document, frame, conversation, conversationContent, location, registrations } = await loadBundle({
    compatible: true,
    pwaMode: 'ios'
  });
  const exports = registrations[0].factory(() => {});
  exports.apply();
  exports.configure({ pullRefresh: { animation: 'text' } });

  conversation.scrollTop = 600;
  conversation.clientHeight = 400;
  conversation.scrollHeight = 1000;
  const event = (y) => ({
    touches: [{ clientX: 180, clientY: y }],
    target: conversationContent
  });

  document.dispatch('touchstart', event(500));
  document.dispatch('touchmove', event(465));
  const indicator = document.body.appended[0];
  assert.equal(indicator?.dataset.state, 'pulling');
  document.dispatch('touchmove', event(500));
  assert.equal(indicator?.dataset.state, 'hidden');
  document.dispatch('touchend', { touches: [] });
  assert.equal(location.reloads, 0);
});

test('client does not start bottom refresh away from the bottom or inside the composer', async () => {
  const { document, frame, conversation, conversationContent, composer, location, registrations } = await loadBundle({
    compatible: true,
    pwaMode: 'standalone'
  });
  const exports = registrations[0].factory(() => {});
  exports.apply();
  const event = (target) => ({
    touches: [{ clientX: 180, clientY: 500 }],
    target
  });

  conversation.scrollTop = 500;
  conversation.clientHeight = 400;
  conversation.scrollHeight = 1000;
  document.dispatch('touchstart', event(conversationContent));
  document.dispatch('touchmove', { touches: [{ clientX: 180, clientY: 420 }], target: conversationContent });
  document.dispatch('touchend', { touches: [] });

  conversation.scrollTop = 600;
  document.dispatch('touchstart', event(composer));
  document.dispatch('touchmove', { touches: [{ clientX: 180, clientY: 420 }], target: composer });
  document.dispatch('touchend', { touches: [] });

  assert.equal(frame.appended.length, 0);
  assert.equal(location.reloads, 0);
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

test('client enables bottom refresh in a narrow touch browser without enabling sidebar swipes', async () => {
  const h = await loadBundle({ compatible: true, mobileMode: true });
  const client = h.registrations[0].factory(() => {});
  client.apply();
  client.configure({ pullRefresh: { animation: 'text' } });

  // A normal mobile tab must not acquire the PWA-only sidebar edge gesture.
  const edgeEvent = (x, y) => ({
    touches: [{ clientX: x, clientY: y }],
    target: h.document.body
  });
  h.document.dispatch('touchstart', edgeEvent(16, 100));
  h.document.dispatch('touchmove', edgeEvent(64, 100));
  h.document.dispatch('touchend', { touches: [] });
  assert.equal(h.toggle.clicks, 0);

  h.conversation.scrollTop = 600;
  h.conversation.clientHeight = 400;
  h.conversation.scrollHeight = 1000;
  const event = y => ({
    touches: [{ clientX: 180, clientY: y }],
    target: h.conversationContent
  });
  h.document.dispatch('touchstart', event(500));
  h.document.dispatch('touchmove', event(200));
  h.document.dispatch('touchend', { touches: [] });
  assert.equal(h.document.body.appended[0].textContent, '正在刷新…');
  assert.equal(h.location.reloads, 1);
});

test('configure cancels an armed refresh without disabling sidebar and can reenable refresh', async () => {
  const { document, conversation, conversationContent, toggle, location, registrations } = await loadBundle({ compatible: true, pwaMode: 'standalone' });
  const client = registrations[0].factory(() => {});
  client.apply();
  client.configure({ pullRefresh: { animation: 'text' } });
  conversation.scrollTop = 600; conversation.clientHeight = 400; conversation.scrollHeight = 1000;
  const event = (x, y) => ({ touches: [{ clientX: x, clientY: y }], target: conversationContent });
  document.dispatch('touchstart', event(180, 500));
  document.dispatch('touchmove', event(180, 260));
  client.configure({ pullRefresh: { enabled: false } });
  assert.equal(document.body.appended.length, 0);
  document.dispatch('touchend', { touches: [] });
  assert.equal(location.reloads, 0);
  document.dispatch('touchstart', event(16, 100));
  document.dispatch('touchmove', event(64, 100));
  document.dispatch('touchend', { touches: [] });
  assert.equal(toggle.clicks, 1);
  client.configure({ pullRefresh: { enabled: true } });
  document.dispatch('touchstart', event(180, 500));
  document.dispatch('touchmove', event(180, 260));
  document.dispatch('touchend', { touches: [] });
  assert.equal(location.reloads, 1);
  assert.throws(() => client.configure({ pullRefresh: { animation: 'unknown' } }), /Invalid/);
});
async function loadBundle({ compatible = false, pwaMode = 'none', mobileMode = false } = {}) {
  const bundle = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  const fake = createFakeDocument(compatible);
  const registrations = [];
  const context = {
    document: fake.document,
    location: fake.location,
    requestAnimationFrame(callback) { callback(); },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    setTimeout(callback, delay) { if (delay === 3000) callback(); return 1; },
    window: {
      __ModuleLoader__: {
        load(record) {
          registrations.push(record);
        }
      }
    }
  };
  const mediaQueries = new Set();
  if (pwaMode === 'standalone') mediaQueries.add('(display-mode: standalone)');
  if (mobileMode) {
    mediaQueries.add('(max-width: 1023px)');
    mediaQueries.add('(pointer: coarse)');
    context.navigator = { ...(context.navigator ?? {}), maxTouchPoints: 5 };
  }
  if (mediaQueries.size) context.matchMedia = (query) => ({ matches: mediaQueries.has(query) });
  if (pwaMode === 'ios') context.navigator = { ...(context.navigator ?? {}), standalone: true };
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
  const body = { appended: [], appendChild(node) { node.parentNode = this; this.appended.push(node); } };
  const sidebarContent = {};
  const conversationContent = {};
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
  const composer = {
    appended: [],
    appendChild(node) {
      node.parentNode = this;
      this.appended.push(node);
    },
    querySelector() {
      return null;
    },
    closest(selector) {
      return selector.includes('[data-composer-seat]') ? this : null;
    },
    contains(node) {
      return this.appended.includes(node);
    }
  };
  const conversation = {
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
    querySelector(selector) {
      return selector === '[data-composer-seat]' ? composer : null;
    },
    contains(node) {
      return node === conversationContent || node === composer || composer.contains(node);
    }
  };
  const frame = {
    collapsed: true,
    appended: [],
    appendChild(node) {
      node.parentNode = this;
      this.appended.push(node);
    },
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
        attributes: {},
        style: {
          values: {},
          setProperty(name, value) {
            this.values[name] = value;
          }
        },
        appended: [],
        appendChild(node) { node.parentNode = this; this.appended.push(node); },
        parentNode: null,
        textContent: '',
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        remove() {
          const index = head.appended.indexOf(this);
          if (index >= 0) head.appended.splice(index, 1);
          const parent = this.parentNode;
          const parentIndex = parent?.appended?.indexOf(this) ?? -1;
          if (parentIndex >= 0) parent.appended.splice(parentIndex, 1);
          this.parentNode = null;
        }
      };
    },
    querySelector(selector) {
      if (!selectors.has(selector)) return null;
      if (selector === '[class$="_frame"]') return frame;
      if (selector === '[class$="_sidebarCol"]') return sidebar;
      if (selector === '[data-conversation-scroll]') return conversation;
      return {};
    },
    querySelectorAll(selector) {
      return [];
    },
    addEventListener(type, listener, options) {
      const entries = listeners.get(type) ?? [];
      if (!entries.some(entry => entry.listener === listener)) entries.push({ listener, passive: options?.passive === true });
      listeners.set(type, entries);
    },
    removeEventListener(type, listener) {
      const entries = (listeners.get(type) ?? []).filter(entry => entry.listener !== listener);
      if (entries.length) listeners.set(type, entries); else listeners.delete(type);
    },
    dispatch(type, event) {
      for (const entry of [...(listeners.get(type) ?? [])]) entry.listener(event);
    },
    listenerTypes() {
      return [...listeners.keys()].sort();
    },
    listenersArePassive() {
      return [...listeners.values()].flat().every(({ passive }) => passive);
    }
  };
  body.ownerDocument = document;
  const location = {
    reloads: 0,
    reload() {
      this.reloads += 1;
    }
  };
  return { document, frame, sidebarContent, toggle, conversation, conversationContent, composer, location };
}

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {}

  disconnect() {}
}


test('refresh feedback precedes navigation and disabling cancels scheduled reload', async () => {
  for (const disable of [false, true]) {
    const h = await loadBundle({ compatible: true, pwaMode: 'ios' });
    const frames = [];
    h.context.requestAnimationFrame = callback => frames.push(callback);
    const client = h.registrations[0].factory(() => {});
    client.apply(); client.configure({ pullRefresh: { animation: 'text' } });
    h.conversation.scrollTop = 600; h.conversation.clientHeight = 400; h.conversation.scrollHeight = 1000;
    const event = y => ({ touches: [{ clientX: 180, clientY: y }], target: h.conversationContent });
    h.document.dispatch('touchstart', event(500));
    h.document.dispatch('touchmove', event(200));
    h.document.dispatch('touchend', { touches: [] });
    assert.equal(h.document.body.appended[0].textContent, '正在刷新…');
    assert.equal(h.location.reloads, 0);
    frames.shift()(); // First frame leaves time for feedback to paint.
    assert.equal(h.location.reloads, 0);
    if (disable) client.configure({ pullRefresh: { enabled: false } });
    frames.shift()();
    assert.equal(h.location.reloads, disable ? 0 : 1);
  }
});
