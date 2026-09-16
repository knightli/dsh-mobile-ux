window.__ModuleLoader__.load({
  id: "dsh-mobile-ux",
  factory: function (require) {
    const module = { exports: {} };
    const exports = module.exports;
    const STYLE_ID = "dsh-mobile-ux/mobile.css";
    const EDGE_SWIPE_MAX_START_X = 64;
    const SWIPE_TRIGGER_DISTANCE = 48;
    const SWIPE_AXIS_TOLERANCE = 48;
    const REFRESH_HINT_DISTANCE = 28;
    const REFRESH_TRIGGER_DISTANCE = 72;
    const REFRESH_AXIS_TOLERANCE = 48;
    const REFRESH_BOTTOM_TOLERANCE = 4;
    const REFRESH_INDICATOR_ATTRIBUTE = 'data-dsh-mobile-refresh-indicator';
    const CSS_TEXT = "/*\n * DSH mobile shell adaptation.\n *\n * The selectors intentionally use stable data attributes where DSH exposes\n * them, and semantic CSS-module suffixes only as a compatibility fallback.\n * Generated build-specific selector prefixes are intentionally not used.\n *\n * Desktop is untouched: every declaration below is scoped to the narrow\n * viewport media query. The JavaScript entry only owns style injection and\n * compatibility reporting; layout remains CSS-owned.\n */\n\n@media (max-width: 1023px) {\n  [class$=\"_frame\"] {\n    --dsh-mobile-sidebar-width: min(280px, calc(100vw - 16px));\n    --dsh-mobile-safe-bottom: env(safe-area-inset-bottom, 0px);\n    --dsh-mobile-viewport-height: 100dvh;\n    grid-template-columns: 0 minmax(0, 1fr) 0 !important;\n    min-block-size: var(--dsh-mobile-viewport-height);\n    max-block-size: var(--dsh-mobile-viewport-height);\n  }\n\n  [class$=\"_centerCol\"] {\n    grid-column: 2;\n  }\n\n  [class$=\"_detailsCol\"] {\n    grid-column: 3;\n  }\n\n  [class$=\"_sessionLogButton\"] {\n    display: none !important;\n  }\n\n  [class$=\"_handle\"] {\n    display: none !important;\n  }\n\n  [class$=\"_sidebarCol\"] {\n    position: absolute;\n    z-index: 40;\n    inset-block: 0;\n    inset-inline-start: 0;\n    width: var(--dsh-mobile-sidebar-width) !important;\n    overflow: visible;\n    box-shadow: 12px 0 32px rgb(15 23 42 / 18%);\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] {\n    inset-block-start: 8px;\n    inset-block-end: auto;\n    inset-inline-start: 8px;\n    width: 36px !important;\n    height: 36px;\n    border-radius: 12px;\n    overflow: hidden;\n    box-shadow: 0 8px 24px rgb(15 23 42 / 22%);\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_collapsed\"] {\n    width: 36px !important;\n    height: 36px;\n    min-width: 36px;\n    min-height: 36px;\n    margin: 0 !important;\n    padding: 0 !important;\n    border-radius: inherit;\n    box-sizing: border-box;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_logoRow\"] {\n    width: 36px;\n    height: 36px;\n    margin: 0 !important;\n    padding: 0 !important;\n    justify-content: center;\n    gap: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_iconButton\"],\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_toggle\"] {\n    width: 36px !important;\n    height: 36px !important;\n    margin: 0 !important;\n    padding: 0 !important;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] [class*=\"_railFish\"] {\n    width: 24px;\n    height: 24px;\n  }\n\n  [class$=\"_sidebarCol\"] [class*=\"_toggle\"] ~ [role=\"tooltip\"] {\n    display: none !important;\n    pointer-events: none;\n  }\n\n  [class$=\"_frame\"]:not([data-sidebar-collapsed])::after {\n    content: \"\";\n    position: absolute;\n    z-index: 35;\n    inset: 0;\n    inset-inline-start: var(--dsh-mobile-sidebar-width);\n    background: rgb(15 23 42 / 12%);\n    pointer-events: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_titleRow\"] {\n    gap: 8px;\n    flex-wrap: nowrap;\n  }\n\n  [class$=\"_frame\"] [class$=\"_titleCluster\"] {\n    min-inline-size: 0;\n    flex-wrap: nowrap;\n  }\n\n  [class$=\"_frame\"] [class$=\"_headerActions\"] {\n    flex: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_header\"] {\n    padding-inline-start: 56px;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_titleCluster\"] {\n    min-inline-size: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"] [class$=\"_tabs\"] {\n    min-inline-size: 0;\n    max-inline-size: 100%;\n    overflow-x: auto;\n    scrollbar-width: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_tabs\"]::-webkit-scrollbar {\n    display: none;\n  }\n\n  [class$=\"_frame\"] [data-conversation-scroll] {\n    --dsh-composer-side-clearance: 0px;\n    min-block-size: 0;\n    max-block-size: calc(var(--dsh-mobile-viewport-height) - var(--dsh-mobile-safe-bottom));\n  }\n\n  [class$=\"_frame\"] [data-composer-seat] {\n    padding-inline: 12px;\n    padding-block-end: max(8px, var(--dsh-mobile-safe-bottom));\n    position: sticky;\n    inset-block-end: 0;\n    z-index: 7;\n  }\n\n  [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator] {\n    --dsh-mobile-refresh-progress: 0;\n    position: fixed;\n    z-index: 50;\n    inset-inline-start: 50%;\n    inset-block-end: calc(env(safe-area-inset-bottom, 0px) + 12px);\n    max-inline-size: calc(100vw - 24px);\n    color: var(--dsw-alias-label-secondary, #666);\n    font-size: 12px;\n    line-height: 18px;\n    text-align: center;\n    white-space: nowrap;\n    pointer-events: none;\n    opacity: 0;\n    transform: translate(-50%, calc((1 - var(--dsh-mobile-refresh-progress)) * 100%));\n    transition: opacity 160ms ease, transform 160ms ease;\n  }\n\n  [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator][data-state=\"pulling\"],\n  [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator][data-state=\"armed\"] {\n    opacity: 1;\n  }\n\n  [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator][data-state=\"armed\"] {\n    color: var(--dsw-static-deepseek-500, #4d8dff);\n  }\n\n  [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator][data-dragging=\"true\"] {\n    transition: none;\n  }\n\n  @media (prefers-reduced-motion: reduce) {\n    [class$=\"_frame\"] [data-dsh-mobile-refresh-indicator] {\n      transition: none;\n    }\n  }\n\n  [class$=\"_frame\"] [data-composer-card] {\n    max-inline-size: 100%;\n  }\n\n  /* The conversation viewport also contains the composer; leave its input\n   * scroll wrapper alone while tightening the message-list scroll inner. */\n  [class$=\"_frame\"] [data-conversation-scroll] [class$=\"_scroll\"]:not([data-composer-seat] [class$=\"_scroll\"]) {\n    padding: 12px 12px 76px;\n  }\n}\n";
    let observer;
    let timeout;
    let gestureCleanup;
    let refreshIndicator;

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

    function findSidebarToggle() {
      const frame = document.querySelector('[class$="_frame"]');
      const sidebar = frame?.querySelector('[class$="_sidebarCol"]');
      return sidebar?.querySelector('[class*="_toggle"]');
    }

    function findConversationScroll() {
      return document.querySelector('[data-conversation-scroll]');
    }

    function isAtBottom(scroller) {
      return Number.isFinite(scroller?.scrollTop)
        && Number.isFinite(scroller?.clientHeight)
        && Number.isFinite(scroller?.scrollHeight)
        && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - REFRESH_BOTTOM_TOLERANCE;
    }

    function isRefreshExcludedTarget(target) {
      return Boolean(target?.closest?.('[data-composer-seat], input, textarea, select, button, a, [contenteditable="true"]'));
    }

    function canStartRefresh(scroller, target) {
      if (!scroller || !isAtBottom(scroller)) return false;
      if (typeof scroller.contains === 'function' && !scroller.contains(target)) return false;
      return !isRefreshExcludedTarget(target);
    }

    function refreshHost(scroller, frame) {
      return frame ?? scroller;
    }

    function ensureRefreshIndicator(scroller, frame) {
      const host = refreshHost(scroller, frame);
      if (refreshIndicator?.parentNode === host) return refreshIndicator;
      refreshIndicator?.remove?.();
      refreshIndicator = undefined;
      if (!host || typeof document.createElement !== 'function' || typeof host.appendChild !== 'function') return undefined;
      const indicator = document.createElement('div');
      indicator.setAttribute(REFRESH_INDICATOR_ATTRIBUTE, '');
      indicator.setAttribute('role', 'status');
      indicator.setAttribute('aria-live', 'polite');
      indicator.textContent = '松开手后刷新页面';
      host.appendChild(indicator);
      refreshIndicator = indicator;
      setRefreshIndicatorState(0);
      return indicator;
    }

    function setRefreshIndicatorState(distance) {
      if (!refreshIndicator) return;
      const state = distance >= REFRESH_TRIGGER_DISTANCE
        ? 'armed'
        : distance >= REFRESH_HINT_DISTANCE ? 'pulling' : 'hidden';
      const progress = Math.min(1, Math.max(0, distance / REFRESH_TRIGGER_DISTANCE));
      refreshIndicator.dataset.state = state;
      refreshIndicator.dataset.dragging = distance > 0 ? 'true' : 'false';
      refreshIndicator.style.setProperty('--dsh-mobile-refresh-progress', String(progress));
    }

    function removeRefreshIndicator() {
      refreshIndicator?.remove?.();
      refreshIndicator = undefined;
    }

    function removeSidebarGestures() {
      gestureCleanup?.();
      gestureCleanup = undefined;
      removeRefreshIndicator();
    }

    function installSidebarGestures() {
      if (gestureCleanup || typeof document?.addEventListener !== 'function' || !isPwaContext()) return;
      let start;
      let triggered = false;
      let refreshArmed = false;
      const firstTouch = (event) => event.touches?.[0];
      const reset = () => {
        start = undefined;
        triggered = false;
        refreshArmed = false;
        setRefreshIndicatorState(0);
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
          const conversation = findConversationScroll();
          if (point && event.touches?.length === 1 && canStartRefresh(conversation, event.target)) {
            const indicator = ensureRefreshIndicator(conversation, frame);
            if (indicator) {
              start = { x: point.clientX, y: point.clientY, action: 'refresh', conversation };
              triggered = false;
              refreshArmed = false;
              setRefreshIndicatorState(0);
              return;
            }
          }
          reset();
          return;
        }
        start = { x: point.clientX, y: point.clientY, action: opens ? 'open' : 'close' };
        triggered = false;
        refreshArmed = false;
        setRefreshIndicatorState(0);
      };
      const onTouchMove = (event) => {
        if (!start || event.touches?.length !== 1) return;
        const point = firstTouch(event);
        if (!point) return;
        if (start.action === 'refresh') {
          const horizontalDistance = Math.abs(point.clientX - start.x);
          if (horizontalDistance > REFRESH_AXIS_TOLERANCE || !isAtBottom(start.conversation)) {
            reset();
            return;
          }
          const distance = Math.max(0, start.y - point.clientY);
          refreshArmed = distance >= REFRESH_TRIGGER_DISTANCE;
          setRefreshIndicatorState(distance);
          return;
        }
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
      const onTouchEnd = () => {
        const refresh = start?.action === 'refresh' && refreshArmed;
        reset();
        if (refresh) globalThis.location?.reload?.();
      };
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
          publish('compatible', { compatibility });
        } else {
          removeSidebarGestures();
          removeOwnedStyle();
          publish('incompatible', { compatibility });
        }
      }, 5000);
    }

    exports.apply = apply;
    return module.exports;
  }
});
