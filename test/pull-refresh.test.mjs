import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePullState } from '../src/features/pull-refresh/core.mjs';
import { createPullRefreshFeature } from '../src/features/pull-refresh/feature.mjs';
import { createWhaleRenderer } from '../src/features/pull-refresh/whale-renderer.mjs';

function harness(options = {}) {
  const eventTarget = new EventTarget();
  const scroller = { contains: () => true };
  let target = { scroller, host: {} };
  let bottom = true;
  let refreshes = 0;
  const views = [];
  const feature = createPullRefreshFeature({
    eventTarget, resolveTarget: () => target, isAtBottom: () => bottom,
    onRefresh: () => refreshes++,
    ...options,
    createRenderer({ onCancel }) {
      const view = { onCancel, frames: [], destroyed: false, update(state) { this.frames.push(state); }, destroy() { this.destroyed = true; } };
      views.push(view);
      return view;
    },
  });
  const emit = (type, y = 500, extra = {}) => {
    const event = new Event(type);
    Object.assign(event, { touches: type === 'touchend' ? [] : [{ identifier: 1, clientX: 180, clientY: y }], ...extra });
    eventTarget.dispatchEvent(event);
  };
  return { feature, views, emit, get refreshes() { return refreshes; },
    detach() { target = null; }, leaveBottom() { bottom = false; } };
}

test('feature disable cancels armed refresh; reenable is idempotent; destroy is terminal', () => {
  const h = harness();
  h.emit('touchstart'); h.emit('touchmove', 350);
  assert.equal(h.views.length, 0);
  h.feature.setEnabled(true); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 350);
  assert.equal(h.views.length, 1);
  h.feature.setEnabled(false); h.emit('touchend');
  assert.equal(h.refreshes, 0);
  assert.equal(h.views[0].destroyed, true);
  h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 350); h.emit('touchend'); h.emit('touchend');
  assert.equal(h.refreshes, 1);
  h.feature.destroy(); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 350); h.emit('touchend');
  assert.equal(h.refreshes, 1);
});

test('cancel, multiple touches, replacement, and lost bottom cannot refresh', () => {
  for (const reason of ['cancel', 'multi', 'detach', 'bottom']) {
    const h = harness(); h.feature.setEnabled(true);
    h.emit('touchstart'); h.emit('touchmove', 350);
    if (reason === 'cancel') h.emit('touchcancel');
    if (reason === 'multi') h.emit('touchmove', 350, { touches: [{}, {}] });
    if (reason === 'detach') h.detach();
    if (reason === 'bottom') h.leaveBottom();
    h.emit('touchend');
    assert.equal(h.refreshes, 0, reason);
    assert.equal(h.views[0].destroyed, true, reason);
  }
});

test('retreat disarms; overdrag stays unbounded; direction survives stationary frames', () => {
  const h = harness(); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', -580);
  assert.equal(h.views[0].frames.at(-1).progress, 10);
  h.emit('touchmove', 470); h.emit('touchmove', 470);
  assert.equal(h.views[0].frames.at(-1).reversing, true);
  h.emit('touchend'); assert.equal(h.refreshes, 0);
});

function rendererHost() {
  const nodes = new Map();
  function node() {
    return { style: { setProperty(k, v) { this[k] = v; } }, attrs: {}, classList: { values: new Map(), toggle(key, value) { this.values.set(key, value); } },
      children: [], appendChild(child) { this.children.push(child); },
      setAttribute(k, v) { this.attrs[k] = v; }, remove() { this.removed = true; },
      attachShadow() { return { querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, node());
        return nodes.get(selector);
      } }; } };
  }
  const host = { ownerDocument: { createElement: node }, appendChild(child) { this.child = child; } };
  return { host, nodes };
}

test('whale renderer replays both side streams, suppresses retreat drops, and scales/fades prompt', () => {
  const { host, nodes } = rendererHost();
  const renderer = createWhaleRenderer({ host });
  const frame = (p, direction = 1) => renderer.update({ ...calculatePullState(p * 108), direction });
  frame(1.6);
  const paths = ['#spout-upper-left', '#spout-upper-right', '#spout-lower-left', '#spout-lower-right'];
  const final = paths.map(id => nodes.get(id).attrs.d);
  frame(1.71);
  paths.forEach((id, i) => {
    assert.notEqual(nodes.get(id).attrs.d, final[i]);
    assert.ok(Number(nodes.get(id).style.opacity) < 1);
  });
  frame(1.2, -1);
  for (const id of ['#spout-center-drop', '#spout-left-drop', '#spout-right-drop']) assert.equal(nodes.get(id).style.opacity, '0');
  assert.equal(nodes.get('#prompt').textContent, '');
  frame(1.21);
  assert.ok(Number(nodes.get('#spout-left-drop').style.opacity) > 0);
  frame(2.4);
  assert.match(nodes.get('.drag-hint').style.transform, /scale\(1\.25/);
  assert.ok(Math.abs(Number(nodes.get('.drag-hint').style.opacity) - 0.5) < 0.001);
  frame(2.81); assert.equal(nodes.get('.drag-hint').style.opacity, '0');
  renderer.destroy(); assert.equal(host.child.removed, true);
});


test('high forward progress keeps sea, whale and fountain visible after text fades', () => {
  const { host, nodes } = rendererHost();
  const renderer = createWhaleRenderer({ host });
  for (const progress of [2, 2.8, 4, 6, 10]) {
    renderer.update(calculatePullState(progress * 108));
    assert.equal(host.child.hidden, false);
    assert.notEqual(host.child.removed, true);
    assert.equal(nodes.get('#refresh-stage').classList.values.get('surface-visible'), true);
    assert.equal(nodes.get('#refresh-stage').classList.values.get('whale-visible'), true);
    assert.equal(nodes.get('#refresh-stage').style['--sea-offset'], '0%');
    assert.equal(nodes.get('#spout').style.opacity, '1');
    if (progress >= 2.8) assert.ok(Number(nodes.get('.drag-hint').style.opacity) < 1e-10);
  }
  renderer.destroy();
});


test('upward pulls survive left and right curves, retreat, and release once', () => {
  for (const side of [-1, 1]) {
    const h = harness(); h.feature.setEnabled(true);
    const move = (x, y) => h.emit('touchmove', y, { touches: [{ identifier: 1, clientX: x, clientY: y }] });
    h.emit('touchstart'); move(180, 470);
    move(180 + side * 80, 350);
    assert.equal(h.views[0].destroyed, false);
    assert.equal(h.views[0].frames.at(-1).phase, 'armed');
    move(180 + side * 110, 460);
    assert.equal(h.views[0].destroyed, false);
    assert.equal(h.views[0].frames.at(-1).phase, 'pulling');
    assert.equal(h.views[0].frames.at(-1).reversing, true);
    move(180 + side * 130, 350);
    h.emit('touchend'); h.emit('touchend');
    assert.equal(h.refreshes, 1);
  }
});

test('horizontal starts do not acquire refresh, and the next gesture starts fresh', () => {
  const h = harness(); h.feature.setEnabled(true);
  h.emit('touchstart');
  h.emit('touchmove', 499, { touches: [{ identifier: 1, clientX: 190, clientY: 499 }] });
  h.emit('touchmove', 495, { touches: [{ identifier: 1, clientX: 250, clientY: 495 }] });
  h.emit('touchmove', 300); h.emit('touchend');
  assert.equal(h.refreshes, 0);
  assert.ok(h.views.every(view => view.destroyed));
  h.emit('touchstart'); h.emit('touchmove', 350); h.emit('touchend');
  assert.equal(h.refreshes, 1);
});


test('release retains refreshing feedback and ignores further gestures until disabled', () => {
  const h = harness(); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  const view = h.views[0];
  assert.equal(view.destroyed, false);
  assert.equal(view.frames.at(-1).phase, 'refreshing');
  assert.equal(h.refreshes, 1);
  h.emit('touchcancel'); h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  assert.equal(view.destroyed, false);
  assert.equal(h.refreshes, 1);
  h.feature.setEnabled(false);
  assert.equal(view.destroyed, true);
});

test('refreshing whale restores the prompt after an overdrag faded it out', () => {
  const { host, nodes } = rendererHost();
  const renderer = createWhaleRenderer({ host });
  const state = calculatePullState(1080);
  renderer.update(state);
  assert.equal(nodes.get('.drag-hint').style.opacity, '0');
  renderer.update({ ...state, phase: 'refreshing' });
  assert.equal(host.child.hidden, false);
  assert.equal(nodes.get('#prompt').textContent, '正在刷新…');
  assert.equal(nodes.get('.drag-hint').style.opacity, '1');
  assert.equal(nodes.get('#refresh-stage').classList.values.get('refreshing'), true);
  renderer.destroy();
});



test('three-second grace period can be cancelled and a later gesture can refresh', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  const h = harness({ refreshDelayMs: 3000 }); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  const first = h.views[0];
  assert.equal(first.frames.at(-1).phase, 'pending');
  t.mock.timers.tick(2999); assert.equal(h.refreshes, 0);
  first.onCancel(); assert.equal(first.destroyed, true);
  t.mock.timers.tick(10000); assert.equal(h.refreshes, 0);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  t.mock.timers.tick(3000);
  assert.equal(h.views[1].frames.at(-1).phase, 'refreshing');
  assert.equal(h.refreshes, 1);
  h.views[1].onCancel(); assert.equal(h.views[1].destroyed, false);
  h.feature.destroy();
});

test('disabling or losing the target during grace period prevents refresh', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  for (const reason of ['disable', 'detach']) {
    const h = harness({ refreshDelayMs: 3000 }); h.feature.setEnabled(true);
    h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
    if (reason === 'disable') h.feature.setEnabled(false); else h.detach();
    t.mock.timers.tick(3000);
    assert.equal(h.refreshes, 0);
    assert.equal(h.views[0].destroyed, true);
    h.feature.destroy();
  }
});

test('pending fountain loops; committing hides cancel and stops the animation', () => {
  const { host, nodes } = rendererHost();
  const frames = new Map(); let id = 0; let cancelled = 0;
  host.ownerDocument.defaultView = {
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(key) { frames.delete(key); },
  };
  const tick = time => { const [key, fn] = frames.entries().next().value; frames.delete(key); fn(time); };
  const renderer = createWhaleRenderer({ host, onCancel: () => cancelled++ });
  const state = { ...calculatePullState(432), phase: 'pending' };
  renderer.update(state);
  const button = nodes.get('#refresh-stage').children[0];
  assert.equal(button.hidden, false); button.onclick(); assert.equal(cancelled, 1);
  tick(0); const paths = ['#spout-main', '#spout-upper-left', '#spout-lower-right'];
  const high = paths.map(key => nodes.get(key).attrs.d);
  tick(450); paths.forEach((key, i) => assert.notEqual(nodes.get(key).attrs.d, high[i]));
  renderer.update({ ...state, phase: 'refreshing' });
  assert.equal(button.hidden, true);
  assert.equal(nodes.get('#prompt').textContent, '正在刷新…');
  assert.equal(frames.size, 0);
  renderer.destroy();
});


test('cancelling clears the reload timer before the retreat finishes', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  const h = harness({ refreshDelayMs: 3000 }); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  const retiring = h.views[0]; let complete;
  retiring.retreat = callback => { complete = callback; };
  retiring.onCancel();
  t.mock.timers.tick(5000);
  assert.equal(h.refreshes, 0);
  assert.equal(retiring.destroyed, false);
  complete(); assert.equal(retiring.destroyed, true);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  t.mock.timers.tick(3000); assert.equal(h.refreshes, 1);
  h.feature.destroy();
});

test('whale cancellation retreats before removing the view', () => {
  const { host, nodes } = rendererHost();
  const frames = new Map(); let id = 0; let cancelled = 0; let complete = 0;
  host.ownerDocument.defaultView = {
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(key) { frames.delete(key); },
  };
  const tick = time => { const [key, fn] = frames.entries().next().value; frames.delete(key); fn(time); };
  const renderer = createWhaleRenderer({ host, onCancel: () => cancelled++ });
  renderer.update({ ...calculatePullState(432), phase: 'pending' });
  const whaleButton = nodes.get('#refresh-stage').children[0];
  whaleButton.onclick(); assert.equal(cancelled, 1);
  renderer.retreat(() => { complete++; renderer.destroy(); });
  assert.equal(whaleButton.hidden, true);
  tick(0); const before = nodes.get('#whale').attrs.transform;
  tick(300); assert.notEqual(nodes.get('#whale').attrs.transform, before);
  assert.equal(nodes.get('#prompt').textContent, '');
  assert.equal(nodes.get('#spout-left-drop').style.opacity, '0');
  tick(500); assert.equal(complete, 1);
  assert.equal(host.child.removed, true); assert.equal(frames.size, 0);
});


test('countdown reports 3, 2, 1 and commits once at three seconds', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  const h = harness({ refreshDelayMs: 3000 }); h.feature.setEnabled(true);
  h.emit('touchstart'); h.emit('touchmove', 100); h.emit('touchend');
  const view = h.views[0];
  assert.equal(view.frames.at(-1).remainingSeconds, 3);
  t.mock.timers.tick(1000); assert.equal(view.frames.at(-1).remainingSeconds, 2);
  t.mock.timers.tick(1000); assert.equal(view.frames.at(-1).remainingSeconds, 1);
  assert.equal(h.refreshes, 0);
  t.mock.timers.tick(1000); assert.equal(view.frames.at(-1).phase, 'refreshing');
  assert.equal(h.refreshes, 1);
  h.feature.destroy();
});


test('the entire cancel surface reacts on primary pointer contact, before click', () => {
  const { host, nodes } = rendererHost(); let cancelled = 0; let prevented = 0;
  const renderer = createWhaleRenderer({ host, onCancel: () => cancelled++ });
  renderer.update({ ...calculatePullState(432), phase: 'pending', remainingSeconds: 1 });
  const button = nodes.get('#refresh-stage').children[0];
  const event = { button: 0, isPrimary: true, preventDefault() { prevented++; }, stopPropagation() {} };
  button.onpointerdown(event);
  assert.equal(cancelled, 1); assert.equal(prevented, 1);
  button.onpointerdown({ ...event, isPrimary: false });
  button.onpointerdown({ ...event, button: 2 });
  assert.equal(cancelled, 1);
  renderer.update({ ...calculatePullState(432), phase: 'refreshing' });
  button.onpointerdown(event); button.onclick(event);
  assert.equal(cancelled, 1);
  renderer.destroy();
});


test('first pending touch cancels before any animation frame or countdown tick', t => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  const { host, nodes } = rendererHost();
  const frames = new Map(); let id = 0; let refreshed = 0; let prevented = 0;
  host.ownerDocument.defaultView = {
    requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(key) { frames.delete(key); },
  };
  const eventTarget = new EventTarget();
  const scroller = { contains: () => true };
  const feature = createPullRefreshFeature({
    eventTarget, resolveTarget: () => ({ scroller, host }), isAtBottom: () => true,
    refreshDelayMs: 3000, onRefresh: () => refreshed++, createRenderer: createWhaleRenderer,
  });
  feature.setEnabled(true);
  for (const [type, y] of [['touchstart', 500], ['touchmove', 200], ['touchend', 200]]) {
    const event = new Event(type);
    event.touches = type === 'touchend' ? [] : [{ identifier: 1, clientX: 180, clientY: y }];
    eventTarget.dispatchEvent(event);
  }
  assert.equal(nodes.get('#prompt').textContent, '3 秒内将刷新页面，点击此处可取消');
  const button = nodes.get('#refresh-stage').children[0];
  button.ontouchstart({ touches: [{}], cancelable: true, preventDefault() { prevented++; }, stopPropagation() {} });
  assert.equal(prevented, 1);
  assert.equal(button.hidden, true);
  // No RAF ran before the cancel; the countdown still must never commit.
  t.mock.timers.tick(4000); assert.equal(refreshed, 0);
  feature.destroy(); assert.equal(frames.size, 0);
});
