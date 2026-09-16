const PLUGIN_ID = 'dsh-mobile-ux';
const STYLE_ID = `${PLUGIN_ID}/mobile.css`;

export function createClientBundle(css) {
  const cssLiteral = JSON.stringify(css);
  return `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PLUGIN_ID)},
  factory: function (require) {
    const module = { exports: {} };
    const exports = module.exports;
    const STYLE_ID = ${JSON.stringify(STYLE_ID)};
    const CSS_TEXT = ${cssLiteral};
    let observer;
    let timeout;
    let accessibilityObserver;
    let accessibilityTimeout;

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

    function publish(state, details) {
      globalThis.__DSH_MOBILE_UX__ = {
        plugin: ${JSON.stringify(PLUGIN_ID)},
        state,
        ...details,
        updatedAt: Date.now()
      };
    }

    function enhanceSessionLogButtons() {
      const buttons = document.querySelectorAll?.('[class$="_sessionLogButton"]') ?? [];
      for (const button of buttons) {
        if (typeof button.getAttribute !== 'function' || typeof button.setAttribute !== 'function') continue;
        const label = button.querySelector?.('span')?.textContent?.trim() || 'Session log';
        if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', label);
        if (!button.getAttribute('title')) button.setAttribute('title', label);
      }
    }

    function stopAccessibilityObserver() {
      accessibilityObserver?.disconnect();
      accessibilityObserver = undefined;
      if (accessibilityTimeout !== undefined) clearTimeout(accessibilityTimeout);
      accessibilityTimeout = undefined;
    }

    function observeSessionLogButtons() {
      enhanceSessionLogButtons();
      if (typeof MutationObserver !== 'function') return;
      stopAccessibilityObserver();
      accessibilityObserver = new MutationObserver(enhanceSessionLogButtons);
      accessibilityObserver.observe(document.documentElement, { childList: true, subtree: true });
      accessibilityTimeout = setTimeout(stopAccessibilityObserver, 5000);
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
      enhanceSessionLogButtons();
      const compatibility = inspectDocument();
      if (compatibility.ok) {
        ensureStyle();
        publish('compatible', { compatibility });
        stopWaiting();
        observeSessionLogButtons();
        return;
      }
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
          publish('compatible', { compatibility });
        } else {
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
