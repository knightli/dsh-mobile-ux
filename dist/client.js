window.__ModuleLoader__.load({
  id: "dsh-mobile-ux",
  factory: function (require) {
    const module = { exports: {} };
    const exports = module.exports;
    const STYLE_ID = "dsh-mobile-ux/mobile.css";
    const CSS_TEXT = "/*\n * DSH mobile shell adaptation.\n *\n * The selectors intentionally use stable data attributes where DSH exposes\n * them, and semantic CSS-module suffixes only as a compatibility fallback.\n * Generated build-specific selector prefixes are intentionally not used.\n *\n * Desktop is untouched: every declaration below is scoped to the narrow\n * viewport media query. The JavaScript entry only owns style injection and\n * compatibility reporting; layout remains CSS-owned.\n */\n\n@media (max-width: 1023px) {\n  [class$=\"_frame\"] {\n    --dsh-mobile-sidebar-width: min(280px, calc(100vw - 16px));\n    --dsh-mobile-safe-bottom: env(safe-area-inset-bottom, 0px);\n    --dsh-mobile-viewport-height: 100dvh;\n    grid-template-columns: 0 minmax(0, 1fr) 0 !important;\n    min-block-size: var(--dsh-mobile-viewport-height);\n    max-block-size: var(--dsh-mobile-viewport-height);\n  }\n\n  [class$=\"_centerCol\"] {\n    grid-column: 2;\n  }\n\n  [class$=\"_detailsCol\"] {\n    grid-column: 3;\n  }\n\n  [class$=\"_sessionLogButton\"] {\n    min-width: 32px !important;\n    width: 32px;\n    height: 32px;\n    gap: 0;\n    padding: 6px !important;\n  }\n\n  [class$=\"_sessionLogButton\"] span {\n    display: none;\n  }\n\n  [class$=\"_sessionLogButton\"] svg {\n    flex: none;\n  }\n\n  [class$=\"_handle\"] {\n    display: none !important;\n  }\n\n  [class$=\"_sidebarCol\"] {\n    position: absolute;\n    z-index: 40;\n    inset-block: 0;\n    inset-inline-start: 0;\n    width: var(--dsh-mobile-sidebar-width) !important;\n    overflow: visible;\n    box-shadow: 12px 0 32px rgb(15 23 42 / 18%);\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_sidebarCol\"] {\n    inset-block-start: 8px;\n    inset-block-end: auto;\n    inset-inline-start: 8px;\n    width: 56px !important;\n    height: 56px;\n    border-radius: 16px;\n    overflow: hidden;\n    box-shadow: 0 8px 24px rgb(15 23 42 / 22%);\n  }\n\n  [class$=\"_frame\"]:not([data-sidebar-collapsed])::after {\n    content: \"\";\n    position: absolute;\n    z-index: 35;\n    inset: 0;\n    inset-inline-start: var(--dsh-mobile-sidebar-width);\n    background: rgb(15 23 42 / 12%);\n    pointer-events: none;\n  }\n\n  [class$=\"_frame\"] [class$=\"_titleRow\"] {\n    gap: 8px;\n  }\n\n  [class$=\"_frame\"] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_header\"] {\n    padding-inline-start: 76px;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_titleCluster\"] {\n    min-inline-size: 0;\n  }\n\n  [class$=\"_frame\"][data-sidebar-collapsed] [class$=\"_headerUtilities\"] {\n    margin-inline-start: 0;\n  }\n\n  [class$=\"_frame\"] [class$=\"_header\"]:has([data-desktop-status]) [class$=\"_titleCluster\"] {\n    flex-wrap: wrap;\n    row-gap: 4px;\n  }\n\n  [class$=\"_frame\"] [class$=\"_header\"]:has([data-desktop-status]) [class$=\"_headerActions\"] {\n    flex-basis: 100%;\n    margin-inline-start: auto;\n    justify-content: flex-end;\n  }\n\n  [class$=\"_frame\"] [class$=\"_header\"]:has([data-desktop-status]) [data-desktop-status] {\n    margin-inline-start: auto;\n    text-align: end;\n  }\n\n  [class$=\"_frame\"] [data-conversation-scroll] {\n    --dsh-composer-side-clearance: 0px;\n    min-block-size: 0;\n    max-block-size: calc(var(--dsh-mobile-viewport-height) - var(--dsh-mobile-safe-bottom));\n    padding-block-end: var(--dsh-mobile-safe-bottom);\n  }\n\n  [class$=\"_frame\"] [data-composer-seat] {\n    padding-inline: 12px;\n    padding-block-end: max(8px, var(--dsh-mobile-safe-bottom));\n    position: sticky;\n    inset-block-end: 0;\n    z-index: 7;\n  }\n\n  [class$=\"_frame\"] [data-composer-card] {\n    max-inline-size: 100%;\n  }\n\n  /* The conversation viewport also contains the composer; leave its input\n   * scroll wrapper alone while tightening the message-list scroll inner. */\n  [class$=\"_frame\"] [data-conversation-scroll] [class$=\"_scroll\"]:not([data-composer-seat] [class$=\"_scroll\"]) {\n    padding: 12px 12px 76px;\n  }\n}\n";
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
        plugin: "dsh-mobile-ux",
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
