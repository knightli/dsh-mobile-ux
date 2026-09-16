window.__ModuleLoader__.load({
  id: "dsh-mobile-ux",
  factory: function (require) {
    const module = { exports: {} };
    const exports = module.exports;
    const STYLE_ID = "dsh-mobile-ux/mobile.css";
    const EDGE_SWIPE_MAX_START_X = 64;
    const SWIPE_TRIGGER_DISTANCE = 48;
    const SWIPE_AXIS_TOLERANCE = 48;
    const CSS_TEXT = "/*\n * DSH mobile shell adaptation.\n *\n * The selectors intentionally use stable data attributes where DSH exposes\n * them, and semantic CSS-module suffixes only as a compatibility fallback.\n * Generated build-specific selector prefixes are intentionally not used.\n *\n * Desktop is untouched: every declaration below is scoped to the narrow\n * viewport media query. The JavaScript entry only owns style injection and\n * compatibility reporting; layout remains CSS-owned.\n */\n\n@media (max-width: 1023px) {\n  [class$=\"_frame\"] {\n    --dsh-mobile-sidebar-width: min(280px, calc(100vw - 16px));\n    --dsh-mobile-safe-bottom: env(safe-area-inset-bottom, 0px);\n    --dsh-mobile-viewport-height: 100dvh;\n    grid-template-columns: 0 minmax(0, 1fr) 0 !important;\n    min-block-size: var(--dsh-mobile-viewport-height);\n    max-block-size: var(--dsh-mobile-viewport-height);\n  }\n\n  [class$=\"_centerCol\"] {\n    grid-column: 2;\n  }\n\n  [class$=\"_detailsCol\"] {\n    grid-column: 3;\n  }\n\n  [class$=\"_sessionLogButton\"] {\n    display: none !important;\n  }\n\n  [class$=\"_handle\"] {\n    display: none !important;\n  }\n\n  [class$=\"_sidebarCol\"] {\n    position: absolute;\n    z-index: 40;\n    inset-block: 0;\n    inset-inline-start: 0;\n    width: var(--dsh-mobile-sidebar-width) !important;\n    overflow: visible;\n    box-shadow: 12px 0 32px rgb(15 23 42 / 18%);\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] {\n    inset-block-start: 8px;\n    inset-block-end: auto;\n    inset-inline-start: 8px;\n    width: 36px !important;\n    height: 36px;\n    border-radius: 12px;\n    overflow: hidden;\n    box-shadow: 0 8px 24px rgb(15 23 42 / 22%);\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_collapsed\"] {\n    width: 36px !important;\n    height: 36px;\n    min-width: 36px;\n    min-height: 36px;\n    margin: 0 !important;\n    padding: 0 !important;\n    border-radius: inherit;\n    box-sizing: border-box;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_logoRow\"] {\n    width: 36px;\n    height: 36px;\n    margin: 0 !important;\n    padding: 0 !important;\n    justify-content: center;\n    gap: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_iconButton\"],\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_toggle\"] {\n    width: 36px !important;\n    height: 36px !important;\n    margin: 0 !important;\n    padding: 0 !important;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_railFish\"] {\n    width: 24px;\n    height: 24px;\n  }\n\n  [class$=\"_sidebarCol\"] [class*=\"_toggle\"] ~ [role=\"tooltip\"] {\n    display: none !important;\n    pointer-events: none;\n  }\n\n  [class$=\"_frame\"]:not([data-sidebar-collapsed])::after {\n    content: \"\";\n    position: absolute;\n    z-index: 35;\n    inset: 0;\n    inset-inline-start: var(--dsh-mobile-sidebar-width);\n    background: rgb(15 23 42 / 12%);\n    pointer-events: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_titleRow\"] {\n    gap: 8px;\n    flex-wrap: nowrap;\n  }\n\n  [class$=\"_frame\"] [class$=\"_titleCluster\"] {\n    min-inline-size: 0;\n    flex-wrap: nowrap;\n  }\n\n  [class$=\"_frame\"] [class$=\"_headerActions\"] {\n    flex: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_header\"] {\n    padding-inline-start: 56px;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_titleCluster\"] {\n    min-inline-size: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"] [class$=\"_tabs\"] {\n    min-inline-size: 0;\n    max-inline-size: 100%;\n    overflow-x: auto;\n    scrollbar-width: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_tabs\"]::-webkit-scrollbar {\n    display: none;\n  }\n\n  [class$=\"_frame\"] [data-conversation-scroll] {\n    --dsh-composer-side-clearance: 0px;\n    min-block-size: 0;\n    max-block-size: calc(var(--dsh-mobile-viewport-height) - var(--dsh-mobile-safe-bottom));\n  }\n\n  [class$=\"_frame\"] [data-composer-seat] {\n    padding-inline: 12px;\n    padding-block-end: max(8px, var(--dsh-mobile-safe-bottom));\n    position: sticky;\n    inset-block-end: 0;\n    z-index: 7;\n  }\n\n  [class$=\"_frame\"] [data-composer-card] {\n    max-inline-size: 100%;\n  }\n\n  /* The conversation viewport also contains the composer; leave its input\n   * scroll wrapper alone while tightening the message-list scroll inner. */\n  [class$=\"_frame\"] [data-conversation-scroll] [class$=\"_scroll\"]:not([data-composer-seat] [class$=\"_scroll\"]) {\n    padding: 12px 12px 76px;\n  }\n}\n";
    let observer;
    let timeout;
    let gestureCleanup;
    let refreshFeature;
    let refreshSettings = { enabled: true, animation: 'whale' };
    function calculatePullState(distance, previous = null, threshold = 108) {
  if (!Number.isFinite(threshold) || threshold <= 0) throw new TypeError('Invalid pull threshold');
  const value = Number.isFinite(distance) ? Math.max(0, distance) : 0;
  const direction = !previous ? 0 : Math.sign(value - previous.distance) || previous.direction;
  return {
    distance: value,
    progress: value / threshold,
    direction,
    reversing: direction < 0,
    phase: value === 0 ? 'hidden' : value >= threshold ? 'armed' : 'pulling',
    overdrag: Math.max(0, value / threshold - 1.6),
  };
}
    function createPullRefreshFeature({
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
    function createWhaleRenderer({ host, onCancel = () => {} }) {
  const document = host.ownerDocument;
  const element = document.createElement('div');
  element.setAttribute('data-dsh-mobile-refresh-indicator', '');
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>    .drag-hint {
      position: absolute;
      inset-inline: 0;
      inset-block-start: 5px;
      z-index: 3;
      text-align: center;
      color: #8291a8;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transform-origin: center center;
      transition: opacity 140ms ease-out;
    }

    .drag-hint strong { color: #c5d5ef; }

    .refresh-stage {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      height: 126px;
      /* The prompt may travel above the stage after 138%; the preview itself
         remains the clipping boundary. */
      overflow: visible;
      pointer-events: none;
    }

    .refresh-stage.surface-visible .drag-hint { opacity: 1; }

    .whale-layer {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      height: 126px;
      display: grid;
      place-items: end center;
      pointer-events: none;
    }

    #whale-svg {
      width: min(270px, 78vw);
      height: 126px;
      overflow: visible;
    }

    .refresh-stage:not(.whale-visible) #whale-svg { opacity: 0; }

    .sea {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      z-index: 2;
      height: var(--surface-height);
      background: #56cde2;
      transform: translateY(var(--sea-offset, 100%));
      overflow: hidden;
    }

    .refresh-stage.surface-visible .sea { transform: translateY(var(--sea-offset, 0%)); }

    .sea::before {
      display: none;
    }

    .sea-wave {
      position: absolute;
      inset-inline: 0;
      inset-block-start: -1px;
      width: 100%;
      height: 10px;
      overflow: visible;
    }


:host { position:fixed; inset:0; z-index:50; pointer-events:none; overflow:hidden; --surface-height:28px; font:12px system-ui; }
.refresh-stage { bottom:0; }
.drag-hint { transition:none; color:var(--dsw-alias-label-secondary,#aab7cb); }
.drag-hint strong { color:inherit; }
.refresh-stage.refreshing .drag-hint strong::after {
  content: ''; display: inline-block; width: 9px; height: 9px; margin-left: 7px;
  border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%;
  vertical-align: -1px; animation: refresh-spin 800ms linear infinite;
}
.cancel-whale { position:absolute; bottom:0; left:0;
  width:100%; height:160px; padding:0; border:0; background:transparent;
  pointer-events:auto; touch-action:manipulation; cursor:pointer; z-index:4; }
@keyframes refresh-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .refresh-stage.refreshing .drag-hint strong::after { animation: none; }
}
</style>      <div class="refresh-stage" id="refresh-stage">
        <div class="drag-hint" role="status" aria-live="polite"><strong id="prompt">上拉试试</strong></div>
        <div class="whale-layer">
          <svg id="whale-svg" viewBox="0 0 240 126" role="img" aria-label="蓝色卡通鲸鱼">
            <defs>
              <clipPath id="above-water">
                <rect x="0" y="0" width="240" height="92"></rect>
              </clipPath>
            </defs>

            <g id="whale" clip-path="url(#above-water)">
            <g id="spout" opacity="0" fill="none" stroke="#54b9ff" stroke-linecap="round" stroke-linejoin="round">
              <path id="spout-center-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-left-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-right-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-main" d="M120 45 C118 38 118 30 120 24" stroke-width="7" opacity="0"></path>
              <path id="spout-upper-left" d="M120 25 C116 18 108 18 102 25" stroke-width="3.5" opacity="0"></path>
              <path id="spout-upper-right" d="M120 25 C124 18 132 18 138 25" stroke-width="3.5" opacity="0"></path>
              <path id="spout-lower-left" d="M120 33 C112 23 100 25 92 35 C88 40 88 46 88 52" stroke-width="3.5" opacity="0"></path>
              <path id="spout-lower-right" d="M120 33 C128 23 140 25 148 35 C152 40 152 46 152 52" stroke-width="3.5" opacity="0"></path>
            </g>
              <path d="M69 98 C69 64 93 38 120 38 C145 38 163 55 170 79 C180 75 187 66 196 65 C192 73 198 79 209 77 C202 88 186 93 170 87 C168 94 169 98 171 101 C145 107 97 107 69 98Z" fill="#2293e6" stroke="#0e4d8a" stroke-width="3"></path>
              <ellipse cx="120" cy="46" rx="6" ry="3" fill="#0e4d8a"></ellipse>

              <g id="eyes-closed" fill="none" stroke="#0e4d8a" stroke-width="3" stroke-linecap="round">
                <path d="M94 66 Q103 73 112 66"></path>
                <path d="M128 66 Q137 73 146 66"></path>
              </g>
              <g id="eyes-half" opacity="0">
                <path d="M94 67 Q103 63 112 67 L112 71 L94 71Z" fill="#fff"></path>
                <path d="M128 67 Q137 63 146 67 L146 71 L128 71Z" fill="#fff"></path>
                <circle cx="103" cy="68" r="4" fill="#0e4d8a"></circle>
                <circle cx="137" cy="68" r="4" fill="#0e4d8a"></circle>
              </g>
              <g id="eyes-open" opacity="0">
                <circle cx="103" cy="67" r="9" fill="#fff"></circle>
                <circle cx="137" cy="67" r="9" fill="#fff"></circle>
                <circle cx="103" cy="67" r="4" fill="#0e4d8a"></circle>
                <circle cx="137" cy="67" r="4" fill="#0e4d8a"></circle>
              </g>
            </g>
          </svg>
        </div>
        <div class="sea" aria-hidden="true">
          <svg class="sea-wave" viewBox="0 0 240 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 C15 0 25 0 40 5 S65 10 80 5 S105 0 120 5 S145 10 160 5 S185 0 200 5 S225 10 240 5" fill="none" stroke="#9bf3fb" stroke-width="3" stroke-linecap="round"></path>
          </svg>
        </div>
      </div>`;
  host.appendChild(element);
    const refreshStage = root.querySelector('#refresh-stage');
    const whale = root.querySelector('#whale');
    const eyesClosed = root.querySelector('#eyes-closed');
    const eyesHalf = root.querySelector('#eyes-half');
    const eyesOpen = root.querySelector('#eyes-open');
    const spout = root.querySelector('#spout');
    const spoutMain = root.querySelector('#spout-main');
    const spoutUpperLeft = root.querySelector('#spout-upper-left');
    const spoutUpperRight = root.querySelector('#spout-upper-right');
    const spoutLowerLeft = root.querySelector('#spout-lower-left');
    const spoutLowerRight = root.querySelector('#spout-lower-right');
    const spoutCenterDrop = root.querySelector('#spout-center-drop');
    const spoutLeftDrop = root.querySelector('#spout-left-drop');
    const spoutRightDrop = root.querySelector('#spout-right-drop');
    const dragHint = root.querySelector('.drag-hint');
    const prompt = root.querySelector('#prompt');
    const threshold = 108;
    const finalProgress = 1.6;
    const surfaceReveal = 30;
    const surfaceStart = surfaceReveal / threshold;
    const promptLiftStart = 1.38;
    const promptFadeStart = 2;
    const promptFadeDuration = 0.8;
    const promptLiftRate = 70;

  const whaleButton = document.createElement('button');
  whaleButton.type = 'button';
  whaleButton.className = 'cancel-whale';
  whaleButton.setAttribute('aria-label', '取消刷新');
  whaleButton.hidden = true;
  whaleButton.onpointerdown = event => {
    if (whaleButton.hidden || event.isPrimary === false || event.button !== 0) return;
    // Cancel on contact: do not wait for a synthesized click near the deadline.
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  };
  whaleButton.ontouchstart = event => {
    if (whaleButton.hidden || event.touches.length !== 1) return;
    // Safari can suppress synthetic clicks while a scroll is settling.
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    onCancel();
  };
  whaleButton.onclick = event => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!whaleButton.hidden) onCancel();
  };
  refreshStage.appendChild(whaleButton);
  const view = document.defaultView;
  let frame = null;
  let pendingState = null;
  let epoch = null;
  let destroyed = false;
  const stopAnimation = () => {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null; pendingState = null; epoch = null;
  };
  function tick(time) {
    frame = null;
    if (!pendingState || destroyed) return;
    epoch ??= time;
    draw(pendingState, 0.97 + 0.03 * Math.cos((time - epoch) * Math.PI * 2 / 900));
    frame = view.requestAnimationFrame(tick);
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function draw(state, pendingProgress = 1) {
      element.hidden = state.phase === 'hidden';
      const refreshing = state.phase === 'refreshing';
      const pending = state.phase === 'pending';
      whaleButton.hidden = !pending;
      refreshStage.classList.toggle('refreshing', refreshing);
      // Restore a visible, settled frame even after a long pull faded the prompt away.
      const p = refreshing || pending ? 1.6 : state.progress;
      const isReversing = !refreshing && !pending && state.direction < 0;
      const surfaceProgress = clamp(p / surfaceStart, 0, 1);
      const whaleProgress = clamp((p - surfaceStart) / (1 - surfaceStart), 0, 1);
      const fountainProgress = clamp((p - 1) / (finalProgress - 1), 0, 1);
      const overdrag = Math.max(0, p - finalProgress);
      const finalFrameProgress = pending ? pendingProgress : p > finalProgress
        ? 0.97 + 0.03 * Math.cos(overdrag * Math.PI * 2 / 0.22)
        : fountainProgress;
      // Once the pull passes the final frame, replay the complete 94%–100%
      // fountain segment. Every fountain element must use this same progress
      // value; otherwise only the center jet moves while the side streams
      // remain frozen at 100%.
      const fountainFrameProgress = pending || p > finalProgress ? finalFrameProgress : fountainProgress;
      const y = 62 - whaleProgress * 50;
      const eyeScale = 0.62 + whaleProgress * 0.38;
      const eyeTransform = `translate(120 68) scale(${eyeScale}) translate(-120 -68)`;
      const arcProgress = clamp((fountainFrameProgress - 0.72) / 0.28, 0, 1);
      const launchProgress = clamp(fountainFrameProgress / 0.9, 0, 1);
      const riseProgress = clamp(fountainFrameProgress / 0.3, 0, 1);
      const fallingDropFade = clamp((launchProgress - 0.68) / 0.32, 0, 1);
      const jetRiseProgress = fountainFrameProgress < 0.72
        ? fountainFrameProgress / 0.72
        : 1;
      const mainTop = pending || p > finalProgress
        ? 8 + (1 - finalFrameProgress) * 70
        : 28 - jetRiseProgress * 20;
      const splashJetProgress = clamp(fountainFrameProgress / 0.72, 0, 1);
      const splashTop = 28 - splashJetProgress * 20;
      const dropY = 43 - 100 * launchProgress + 132 * launchProgress * launchProgress;
      const dropSpread = 3 + launchProgress * 42;
      const centerDropY = 43 - riseProgress * 21;
      const velocityY = -100 + 264 * launchProgress;
      const leftVelocityAngle = Math.atan2(velocityY, -42) * 180 / Math.PI;
      const rightVelocityAngle = Math.atan2(velocityY, 42) * 180 / Math.PI;
      const upperSpan = 4 + arcProgress * 22;
      const upperPeakY = splashTop - arcProgress * 9;
      const upperLeftPath = `M120 ${splashTop + 2} C${120 - upperSpan * 0.2} ${upperPeakY} ${120 - upperSpan * 0.8} ${upperPeakY} ${120 - upperSpan} ${splashTop + 2}`;
      const upperRightPath = `M120 ${splashTop + 2} C${120 + upperSpan * 0.2} ${upperPeakY} ${120 + upperSpan * 0.8} ${upperPeakY} ${120 + upperSpan} ${splashTop + 2}`;
      const lowerStartY = splashTop + 21;
      const lowerSpan = 8 + arcProgress * 29;
      const lowerEndY = lowerStartY + 21 + arcProgress * 18;
      const lowerPeakY = lowerStartY - arcProgress * 10;
      const lowerLeftPath = `M120 ${lowerStartY} C${120 - lowerSpan * 0.25} ${lowerPeakY} ${120 - lowerSpan * 0.78} ${lowerPeakY} ${120 - lowerSpan} ${lowerEndY} C${120 - lowerSpan - 2} ${lowerEndY + 5} ${120 - lowerSpan - 1} ${lowerEndY + 8} ${120 - lowerSpan} ${lowerEndY + 12}`;
      const lowerRightPath = `M120 ${lowerStartY} C${120 + lowerSpan * 0.25} ${lowerPeakY} ${120 + lowerSpan * 0.78} ${lowerPeakY} ${120 + lowerSpan} ${lowerEndY} C${120 + lowerSpan + 2} ${lowerEndY + 5} ${120 + lowerSpan + 1} ${lowerEndY + 8} ${120 + lowerSpan} ${lowerEndY + 12}`;

      refreshStage.style.setProperty('--sea-offset', `${100 - surfaceProgress * 100}%`);
      refreshStage.classList.toggle('surface-visible', p > 0);
      refreshStage.classList.toggle('whale-visible', p >= surfaceStart);
      whale.setAttribute('transform', `translate(0 ${y})`);
      eyesClosed.setAttribute('transform', eyeTransform);
      eyesHalf.setAttribute('transform', eyeTransform);
      eyesOpen.setAttribute('transform', eyeTransform);
      spoutMain.setAttribute('d', `M120 45 C118 38 118 ${mainTop + 8} 120 ${mainTop}`);
      spoutMain.setAttribute('stroke-width', `${4 + jetRiseProgress * 5}`);
      spoutMain.style.opacity = String(clamp(fountainFrameProgress / 0.28, 0, 1));
      spoutUpperLeft.setAttribute('d', upperLeftPath);
      spoutUpperRight.setAttribute('d', upperRightPath);
      spoutLowerLeft.setAttribute('d', lowerLeftPath);
      spoutLowerRight.setAttribute('d', lowerRightPath);
      spoutUpperLeft.style.opacity = String(arcProgress);
      spoutUpperRight.style.opacity = String(arcProgress);
      spoutLowerLeft.style.opacity = String(arcProgress);
      spoutLowerRight.style.opacity = String(arcProgress);
      spoutCenterDrop.setAttribute('transform', `translate(120 ${centerDropY})`);
      const centerDropOpacity = 1 - clamp((fountainFrameProgress - 0.25) / 0.5, 0, 1);
      spoutCenterDrop.style.opacity = isReversing ? '0' : String(centerDropOpacity);
      spoutLeftDrop.setAttribute('transform', `translate(${120 - dropSpread} ${dropY}) rotate(${leftVelocityAngle + 90})`);
      spoutRightDrop.setAttribute('transform', `translate(${120 + dropSpread} ${dropY}) rotate(${rightVelocityAngle + 90})`);
      const sideDropOpacity = 1 - fallingDropFade;
      spoutLeftDrop.style.opacity = isReversing ? '0' : String(sideDropOpacity);
      spoutRightDrop.style.opacity = isReversing ? '0' : String(sideDropOpacity);
      eyesClosed.style.opacity = whaleProgress < 0.28 ? '1' : '0';
      eyesHalf.style.opacity = whaleProgress >= 0.28 && whaleProgress < 0.58 ? '1' : '0';
      eyesOpen.style.opacity = whaleProgress >= 0.58 ? '1' : '0';
      spout.style.opacity = p >= 1 ? '1' : '0';
      const promptLift = Math.max(0, p - promptLiftStart) * promptLiftRate;
      const promptOpacity = 1 - clamp((p - promptFadeStart) / promptFadeDuration, 0, 1);
      const promptScale = 1 + clamp(
        (p - promptLiftStart) / (promptFadeStart + promptFadeDuration - promptLiftStart),
        0,
        1,
      ) * 0.35;
      dragHint.style.transform = `translateY(${-promptLift}px) scale(${promptScale})`;
      dragHint.style.opacity = isReversing || p <= 0 ? '0' : String(promptOpacity);
      prompt.textContent = pending ? `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消` : refreshing ? '正在刷新…' : isReversing
        ? ''
        : p >= 1 ? '喷水中，松手刷新' : p >= surfaceStart ? '继续上拉' : '上拉试试';

  }
  return {
    update(state) {
      if (destroyed) return;
      if (state.phase === 'pending') {
        if (!pendingState) draw(state);
        else prompt.textContent = `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消`;
        pendingState = state;
        if (frame === null && view?.requestAnimationFrame) frame = view.requestAnimationFrame(tick);
      } else {
        stopAnimation();
        draw(state);
      }
    },
    retreat(onComplete) {
      if (destroyed) return;
      stopAnimation();
      const reduced = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const retreatState = progress => ({ phase: progress > 0 ? 'cancelling' : 'hidden', progress, direction: -1 });
      if (!view?.requestAnimationFrame || reduced) {
        draw(retreatState(0)); onComplete(); return;
      }
      draw(retreatState(1.6));
      let started = null;
      const retreatTick = time => {
        frame = null;
        if (destroyed) return;
        started ??= time;
        const t = Math.min(1, (time - started) / 500);
        const eased = t * t * (3 - 2 * t);
        draw(retreatState(1.6 * (1 - eased)));
        if (t === 1) onComplete();
        else frame = view.requestAnimationFrame(retreatTick);
      };
      frame = view.requestAnimationFrame(retreatTick);
    },
    destroy() { destroyed = true; stopAnimation(); element.remove(); },
  };
}
    function createTextRenderer({ host, onCancel = () => {} }) {
  const element = host.ownerDocument.createElement('div');
  element.setAttribute('data-dsh-mobile-refresh-indicator', '');
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.style.cssText = 'position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);left:50%;z-index:50;pointer-events:none;white-space:nowrap;font:12px system-ui;color:var(--dsw-alias-label-secondary,#aab7cb)';
  let pending = false;
  element.onclick = () => { if (pending) onCancel(); };
  element.onkeydown = event => {
    if (pending && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onCancel(); }
  };
  host.appendChild(element);
  return {
    update(state) {
      element.dataset.state = state.phase;
      element.hidden = state.phase === 'hidden' || state.reversing;
      element.textContent = state.phase === 'pending' ? `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消` : state.phase === 'refreshing' ? '正在刷新…' : state.phase === 'armed' ? '松开手后刷新页面' : '继续上拉';
      pending = state.phase === 'pending';
      element.style.pointerEvents = pending ? 'auto' : 'none';
      element.setAttribute('role', pending ? 'button' : 'status');
      element.tabIndex = pending ? 0 : -1;
      element.style.transform = `translate(-50%, ${Math.max(0, 1 - state.progress) * 40}px)`;
    },
    destroy() { element.remove(); },
  };
}

    function styleSelector() {
      return 'style[data-dsh-mobile-ux-style="' + STYLE_ID + '"]';
    }

    function inspectDocument() {
      const frame = document.querySelector('[class$="_frame"]');
      const sidebar = document.querySelector('[class$="_sidebarCol"]');
      const center = document.querySelector('[class$="_centerCol"]');
      const conversation = document.querySelector('[data-conversation-scroll]');
      const composer = document.querySelector('[data-composer-seat]');
      return {
        ok: Boolean(frame && sidebar && center && conversation && composer),
        layout: Boolean(frame && sidebar && center),
        conversation: Boolean(conversation && composer)
      };
    }

    function isPwaContext() {
      if (typeof globalThis.matchMedia === 'function') {
        for (const mode of ['standalone', 'fullscreen', 'minimal-ui']) {
          try {
            if (globalThis.matchMedia('(display-mode: ' + mode + ')').matches) return true;
          } catch {
            // Gesture support must fail closed when display-mode is unavailable.
          }
        }
      }
      return typeof navigator !== 'undefined' && navigator.standalone === true;
    }

    function isMobileTouchContext() {
      // PWA remains a supported fallback, including iOS's navigator.standalone.
      if (isPwaContext()) return true;
      if (typeof globalThis.matchMedia !== 'function') return false;
      try {
        const narrow = globalThis.matchMedia('(max-width: 1023px)').matches;
        const coarse = globalThis.matchMedia('(pointer: coarse)').matches;
        const touchPoints = Number(globalThis.navigator?.maxTouchPoints);
        return narrow && (coarse || touchPoints > 0);
      } catch {
        // Do not bind a document-wide touch handler when capability detection is unavailable.
        return false;
      }
    }

    function findSidebarToggle() {
      const frame = document.querySelector('[class$="_frame"]');
      const sidebar = frame?.querySelector('[class$="_sidebarCol"]');
      return sidebar?.querySelector('[class*="_toggle"]');
    }

    function installRefresh() {
      if (refreshFeature || !isMobileTouchContext()) return;
      refreshFeature = createPullRefreshFeature({
        eventTarget: document,
        // Half-speed animation: twice the physical drag for the same progress.
        threshold: 216,
        refreshDelayMs: 3000,
        resolveTarget() {
          const frame = document.querySelector('[class$="_frame"]');
          const scroller = document.querySelector('[data-conversation-scroll]');
          // Runtime selection is resolved again for every gesture/session.
          if (!frame?.hasAttribute('data-sidebar-collapsed')) return null;
          if (typeof matchMedia === 'function' && matchMedia('(min-width: 1024px)').matches) return null;
          return { host: document.body, scroller };
        },
        isAtBottom(scroller) {
          return Number.isFinite(scroller?.scrollTop)
            && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
        },
        isExcludedTarget(target, event) {
          return event.touches[0].clientX <= EDGE_SWIPE_MAX_START_X
            || Boolean(target?.closest?.('[data-composer-seat], input, textarea, select, button, a, [contenteditable="true"]'));
        },
        onRefresh() {
          const active = refreshFeature;
          const reload = () => {
            if (refreshFeature === active) globalThis.location?.reload?.();
          };
          // Let the refreshing frame paint before starting navigation.
          requestAnimationFrame(() => requestAnimationFrame(reload));
        },
        createRenderer(options) {
          const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
          return refreshSettings.animation === 'text' || reduced
            ? createTextRenderer(options) : createWhaleRenderer(options);
        },
      });
      refreshFeature.setEnabled(refreshSettings.enabled);
    }

    function configure(options = {}) {
      const next = { ...refreshSettings, ...options.pullRefresh };
      if (typeof next.enabled !== 'boolean' || !['whale', 'text'].includes(next.animation)) {
        throw new TypeError('Invalid pullRefresh settings');
      }
      refreshSettings = { enabled: next.enabled, animation: next.animation };
      refreshFeature?.destroy();
      refreshFeature = undefined;
      if (inspectDocument().ok) installRefresh();
      return { pullRefresh: { ...refreshSettings } };
    }

    function removeSidebarGestures() {
      gestureCleanup?.();
      gestureCleanup = undefined;
      refreshFeature?.destroy();
      refreshFeature = undefined;
    }

    function installSidebarGestures() {
      if (gestureCleanup || typeof document?.addEventListener !== 'function' || !isPwaContext()) return;
      let start;
      let triggered = false;
      const firstTouch = (event) => event.touches?.[0];
      const reset = () => {
        start = undefined;
        triggered = false;
      };
      const onTouchStart = (event) => {
        const point = firstTouch(event);
        const frame = document.querySelector('[class$="_frame"]');
        const sidebar = frame?.querySelector('[class$="_sidebarCol"]');
        const collapsed = frame?.hasAttribute('data-sidebar-collapsed') === true;
        const sidebarRect = sidebar?.getBoundingClientRect?.();
        const opens = Boolean(point && collapsed && point.clientX <= EDGE_SWIPE_MAX_START_X);
        const closes = Boolean(point && !collapsed && sidebar && sidebarRect
          && point.clientX >= sidebarRect.left && point.clientX <= sidebarRect.right
          && sidebar.contains?.(event.target));
        if (!point || event.touches?.length !== 1 || (!opens && !closes)) {
          reset();
          return;
        }
        start = { x: point.clientX, y: point.clientY, action: opens ? 'open' : 'close' };
        triggered = false;
      };
      const onTouchMove = (event) => {
        if (!start || event.touches?.length !== 1) return;
        const point = firstTouch(event);
        if (!point) return;
        if (triggered) return;
        const dx = point.clientX - start.x;
        const dy = Math.abs(point.clientY - start.y);
        const distanceReached = start.action === 'open'
          ? dx >= SWIPE_TRIGGER_DISTANCE
          : dx <= -SWIPE_TRIGGER_DISTANCE;
        if (!distanceReached || dy > SWIPE_AXIS_TOLERANCE) return;
        const toggle = findSidebarToggle();
        if (!toggle || typeof toggle.click !== 'function') {
          triggered = true;
          return;
        }
        toggle.click();
        triggered = true;
      };
      const onTouchEnd = reset;
      const onTouchCancel = reset;
      document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
      document.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
      document.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
      document.addEventListener('touchcancel', onTouchCancel, { capture: true, passive: true });
      gestureCleanup = () => {
        document.removeEventListener('touchstart', onTouchStart, true);
        document.removeEventListener('touchmove', onTouchMove, true);
        document.removeEventListener('touchend', onTouchEnd, true);
        document.removeEventListener('touchcancel', onTouchCancel, true);
      };
    }

    function publish(state, details) {
      globalThis.__DSH_MOBILE_UX__ = {
        plugin: "dsh-mobile-ux",
        state,
        ...details,
        updatedAt: Date.now()
      };
    }

    function removeOwnedStyle() {
      document.head.querySelector(styleSelector())?.remove();
    }

    function ensureStyle() {
      let style = document.head.querySelector(styleSelector());
      if (!style) {
        style = document.createElement('style');
        style.dataset.dshMobileUxStyle = STYLE_ID;
        style.textContent = CSS_TEXT;
        document.head.appendChild(style);
      }
      return style;
    }

    function stopWaiting() {
      observer?.disconnect();
      observer = undefined;
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = undefined;
    }

    function evaluate() {
      const compatibility = inspectDocument();
      if (compatibility.ok) {
        ensureStyle();
        installSidebarGestures();
        installRefresh();
        publish('compatible', { compatibility });
        stopWaiting();
        return;
      }
      removeSidebarGestures();
      removeOwnedStyle();
      publish('waiting', { compatibility });
    }

    function apply() {
      if (typeof document === 'undefined' || !document.head) return;
      evaluate();
      if (globalThis.__DSH_MOBILE_UX__?.state === 'compatible') return;
      observer?.disconnect();
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = undefined;
      if (typeof MutationObserver !== 'function') {
        removeSidebarGestures();
        removeOwnedStyle();
        publish('incompatible', { compatibility: inspectDocument() });
        return;
      }
      observer = new MutationObserver(evaluate);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      timeout = setTimeout(() => {
        const compatibility = inspectDocument();
        stopWaiting();
        if (compatibility.ok) {
          ensureStyle();
          installSidebarGestures();
          installRefresh();
          publish('compatible', { compatibility });
        } else {
          removeSidebarGestures();
          removeOwnedStyle();
          publish('incompatible', { compatibility });
        }
      }, 5000);
    }

    exports.apply = apply;
    exports.configure = configure;
    return module.exports;
  }
});
