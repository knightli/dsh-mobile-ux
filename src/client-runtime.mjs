const PLUGIN_ID = 'dsh-mobile-ux';
const STYLE_ID = `${PLUGIN_ID}/mobile.css`;
const EDGE_SWIPE_MAX_START_X = 64;
const SWIPE_TRIGGER_DISTANCE = 48;
const SWIPE_AXIS_TOLERANCE = 48;

export function createClientBundle(css) {
  const cssLiteral = JSON.stringify(css);
  return `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PLUGIN_ID)},
  factory: function (require) {
    const module = { exports: {} };
    const exports = module.exports;
    const STYLE_ID = ${JSON.stringify(STYLE_ID)};
    const EDGE_SWIPE_MAX_START_X = ${String(EDGE_SWIPE_MAX_START_X)};
    const SWIPE_TRIGGER_DISTANCE = ${String(SWIPE_TRIGGER_DISTANCE)};
    const SWIPE_AXIS_TOLERANCE = ${String(SWIPE_AXIS_TOLERANCE)};
    const CSS_TEXT = ${cssLiteral};
    let observer;
    let timeout;
    let gestureCleanup;

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

    function removeSidebarGestures() {
      gestureCleanup?.();
      gestureCleanup = undefined;
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
        if (!start || triggered || event.touches?.length !== 1) return;
        const point = firstTouch(event);
        if (!point) return;
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
        plugin: ${JSON.stringify(PLUGIN_ID)},
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
`;
}
