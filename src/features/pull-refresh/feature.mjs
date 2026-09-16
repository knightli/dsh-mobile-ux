import { calculatePullState } from './core.mjs';

/** Renderer factory: ({ host }) => { update(state), destroy() }.
 * Host owns eligibility, DOM selection, refresh action and settings persistence.
 * Instances start disabled. Disabling cancels a pending refresh synchronously.
 */
export function createPullRefreshFeature({
  eventTarget, resolveTarget, isAtBottom, isExcludedTarget = () => false,
  onRefresh, createRenderer, threshold = 108, axisTolerance = 48, refreshDelayMs = 0,
}) {
  calculatePullState(0, null, threshold);
  let enabled = false;
  let disposed = false;
  let start;
  let renderer;
  let refreshTimer;
  let countdownTimer;
  let state = calculatePullState(0);
  const cancel = () => {
    if (refreshTimer !== undefined) clearTimeout(refreshTimer);
    refreshTimer = undefined;
    if (countdownTimer !== undefined) clearInterval(countdownTimer);
    countdownTimer = undefined;
    start = undefined;
    state = calculatePullState(0);
    renderer?.destroy();
    renderer = undefined;
  };
  const cancelPending = () => {
    if (state.phase !== 'pending') return;
    if (refreshTimer !== undefined) clearTimeout(refreshTimer);
    refreshTimer = undefined;
    if (countdownTimer !== undefined) clearInterval(countdownTimer);
    countdownTimer = undefined;
    state = { ...state, phase: 'cancelling' };
    const retiring = renderer;
    const finish = () => { if (renderer === retiring && state.phase === 'cancelling') cancel(); };
    if (retiring?.retreat) retiring.retreat(finish);
    else finish();
  };
  const valid = (expected = start) => {
    const current = resolveTarget();
    return current?.scroller && current.host && current.scroller === expected?.scroller && current.host === expected?.host
      && current.scroller.isConnected !== false && current.host.isConnected !== false
      && isAtBottom(current.scroller);
  };
  const begin = (event) => {
    if (!enabled || state.phase === 'pending' || state.phase === 'cancelling' || state.phase === 'refreshing') return;
    cancel();
    if (event.touches?.length !== 1 || isExcludedTarget(event.target, event)) return;
    const target = resolveTarget();
    if (!target?.scroller || !target.host || !isAtBottom(target.scroller)
      || !target.scroller.contains(event.target)) return;
    const point = event.touches[0];
    start = { ...target, x: point.clientX, y: point.clientY, id: point.identifier, upward: false };
  };
  const move = (event) => {
    if (!start) return;
    const point = event.touches?.[0];
    if (event.touches?.length !== 1 || point.identifier !== start.id || !valid()) return cancel();
    const horizontal = Math.abs(point.clientX - start.x);
    const upward = start.y - point.clientY;
    if (!start.upward) {
      // Reject horizontal starts, but allow natural arcs after upward intent is clear.
      if (upward >= 12 && upward > horizontal) start.upward = true;
      else if (horizontal > axisTolerance) return cancel();
    }
    state = calculatePullState(upward, state, threshold);
    if (state.distance > 0) renderer ??= createRenderer({ host: start.host, onCancel: cancelPending });
    renderer?.update(state);
  };
  const end = (event) => {
    if (!start) return;
    if (event.touches?.length) return cancel();
    const refresh = state.phase === 'armed' && valid();
    if (!refresh) return cancel();
    const target = start;
    start = undefined;
    const commit = () => {
      refreshTimer = undefined;
      if (countdownTimer !== undefined) clearInterval(countdownTimer);
      countdownTimer = undefined;
      if (!enabled || disposed || !valid(target)) return cancel();
      state = { ...state, phase: 'refreshing', direction: 0, reversing: false };
      renderer?.update(state);
      onRefresh();
    };
    if (refreshDelayMs > 0) {
      state = { ...state, phase: 'pending', remainingSeconds: Math.ceil(refreshDelayMs / 1000), direction: 0, reversing: false };
      renderer?.update(state);
      const deadline = Date.now() + refreshDelayMs;
      countdownTimer = setInterval(() => {
        if (state.phase !== 'pending') return;
        const remainingSeconds = Math.max(1, Math.ceil((deadline - Date.now()) / 1000));
        if (remainingSeconds !== state.remainingSeconds) {
          state = { ...state, remainingSeconds };
          renderer?.update(state);
        }
      }, 1000);
      refreshTimer = setTimeout(commit, refreshDelayMs);
    } else commit();
  };
  const listeners = { touchstart: begin, touchmove: move, touchend: end, touchcancel: () => { if (state.phase !== 'refreshing' && state.phase !== 'pending' && state.phase !== 'cancelling') cancel(); } };
  function setEnabled(value) {
    if (disposed) return;
    const next = Boolean(value);
    if (next === enabled) return;
    enabled = next;
    for (const [type, listener] of Object.entries(listeners)) {
      if (enabled) eventTarget.addEventListener(type, listener, { capture: true, passive: true });
      else eventTarget.removeEventListener(type, listener, { capture: true });
    }
    if (!enabled) cancel();
  }
  return {
    setEnabled,
    destroy() { setEnabled(false); disposed = true; },
  };
}
