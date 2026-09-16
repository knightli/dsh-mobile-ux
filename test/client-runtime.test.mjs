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
  const { context, document, registrations, sessionLogButton } = await loadBundle({ compatible: true, sessionLog: true });
  const exports = registrations[0].factory(() => {});

  exports.apply();
  exports.apply();

  assert.equal(document.head.appended.length, 1);
  assert.match(document.head.appended[0].textContent, /grid-template-columns: 0 minmax\(0, 1fr\) 0/);
  assert.equal(context.__DSH_MOBILE_UX__.state, 'compatible');
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.ok, true);
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.layout, true);
  assert.equal(context.__DSH_MOBILE_UX__.compatibility.conversation, true);
  assert.equal(sessionLogButton.getAttribute('aria-label'), 'Session log');
  assert.equal(sessionLogButton.getAttribute('title'), 'Session log');
});

test('client apply fails closed without compatible hooks', async () => {
  const { context, document, registrations } = await loadBundle({ compatible: false });
  const exports = registrations[0].factory(() => {});

  exports.apply();

  assert.equal(document.head.appended.length, 0);
  assert.equal(context.__DSH_MOBILE_UX__.state, 'incompatible');
});

test('client accessibility enhancement handles a late Session log mount and cleans up', async () => {
  const { document, registrations, mutationObservers, timers } = await loadBundle({ compatible: true });
  const exports = registrations[0].factory(() => {});

  exports.apply();
  const lateButton = document.addSessionLogButton();
  assert.equal(mutationObservers.length, 1);
  mutationObservers[0].callback([]);

  assert.equal(lateButton.getAttribute('aria-label'), 'Session log');
  assert.equal(lateButton.getAttribute('title'), 'Session log');
  timers[0].callback();
  assert.equal(mutationObservers[0].disconnected, true);
});

async function loadBundle({ compatible = false, sessionLog = false } = {}) {
  const bundle = await readFile(new URL('../dist/client.js', import.meta.url), 'utf8');
  const { document, sessionLogButton } = createFakeDocument(compatible, sessionLog);
  const registrations = [];
  const mutationObservers = [];
  const timers = [];
  const context = {
    document,
    clearTimeout(id) {
      if (timers[id]) timers[id].cleared = true;
    },
    setTimeout(callback) {
      timers.push({ callback, cleared: false });
      return timers.length - 1;
    },
    window: {
      __ModuleLoader__: {
        load(record) {
          registrations.push(record);
        }
      }
    }
  };
  if (compatible) {
    context.MutationObserver = class extends FakeMutationObserver {
      constructor(callback) {
        super(callback);
        mutationObservers.push(this);
      }
    };
  }
  vm.runInNewContext(bundle, context);
  return { context, document, registrations, sessionLogButton, mutationObservers, timers };
}

function createFakeDocument(compatible, sessionLog) {
  const selectors = compatible
    ? new Set([
      '[class$="_frame"]',
      '[class$="_sidebarCol"]',
      '[class$="_centerCol"]',
      '[data-conversation-scroll]',
      '[data-composer-seat]'
    ])
    : new Set();
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
  const sessionLogButtons = sessionLog ? [createSessionLogButton()] : [];
  const document = {
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
      return selectors.has(selector) ? {} : null;
    },
    querySelectorAll(selector) {
      return selector === '[class$="_sessionLogButton"]' ? sessionLogButtons : [];
    }
  };
  return {
    document: {
      ...document,
      addSessionLogButton() {
        const button = createSessionLogButton();
        sessionLogButtons.push(button);
        return button;
      }
    },
    sessionLogButton: sessionLogButtons[0] ?? null
  };
}

function createSessionLogButton() {
  return {
    attributes: new Map(),
    querySelector(selector) {
      return selector === 'span' ? { textContent: 'Session log' } : null;
    },
    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      this.attributes.set(name, value);
    }
  };
}

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.disconnected = false;
  }

  observe() {}

  disconnect() {
    this.disconnected = true;
  }
}
