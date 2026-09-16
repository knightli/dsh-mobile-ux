# Pull refresh module

The browser client exports `configure({ pullRefresh: { enabled, animation } })`.
Defaults are `enabled: true`, `animation: 'whale'`. The supported animations are
`whale` and `text`. Settings updates apply immediately and return a copy of the
effective settings. Disabling or changing animation cancels any pending refresh,
removes its view and listeners, and leaves sidebar gestures working. Invalid
settings throw before modifying the active feature.

This is the integration point for a future settings UI. No settings UI or
persistence is implemented yet; the host owns saving and restoring preferences.
`configure()` does not install or enable the rest of the plugin. Call the usual
client `apply()` to initialize the plugin. The browser entry is a DSH module,
not a browser ESM export; the configuration method belongs to its factory exports.

## Reuse without DSH

The package subpath `dsh-mobile-ux/pull-refresh` exports ordinary ESM factories:

```js
import { createPullRefreshFeature, createWhaleRenderer }
  from 'dsh-mobile-ux/pull-refresh';

const feature = createPullRefreshFeature({
  eventTarget: document,
  resolveTarget: () => ({ scroller, host: document.body }),
  isAtBottom: el => el.scrollTop + el.clientHeight >= el.scrollHeight - 4,
  isExcludedTarget: el => Boolean(el.closest('input, textarea, button, a')),
  onRefresh: () => location.reload(),
  createRenderer: createWhaleRenderer,
});
feature.setEnabled(true);
// feature.setEnabled(false); // cancels pending refresh and removes the view
// feature.destroy();         // terminal; later enabling has no effect
```

`resolveTarget()` returns null when interaction is not permitted. It is checked
again during movement and release, so a replaced or disconnected scroll target
cannot trigger a stale refresh. A gesture must start inside the scroller, at its
bottom, with one touch. An upward movement of at least 12px that exceeds horizontal
movement locks the direction for that gesture. Subsequent left/right curves do not
cancel it; progress still follows vertical distance. Before direction lock, horizontal
deviation over 48px cancels it. Multiple touches and touchcancel still cancel it. Listeners are passive: native scrolling and navigation are not blocked.
On armed release the DSH adapter enters a 3-second `pending` grace period.
The fountain loops from 94% to 100%. The label counts down “3 秒内将刷新页面，点击此处可取消” through 2 and 1. Clicking anywhere in the bottom 160px refresh area (prompt, fountain, whale or sea)
cancels the timer on primary pointer contact (including transparent gaps), then plays a 500ms retreat below the water before
restoring normal interaction. The refresh-area cancel target is disabled during retreat and real
refresh; no separate cancel link is shown. The text-only renderer makes the
countdown itself cancellable instead. Reduced-motion users skip the retreat animation. After 3 seconds the refresh-area cancel target hides
and the module enters `refreshing`. Repeated gestures are ignored in both phases.
The generic module takes `refreshDelayMs` (default 0); the DSH adapter passes 3000.
The DSH adapter gives the feedback a paint frame before reloading; it shows “正在刷新…”
until the new document replaces it. While waiting, only the loading spinner animates;
the whale, fountain and sea remain on a settled frame. Disabling/destroying removes
the view and cancels any pending timer. The scroll target is revalidated before refresh.
The module performs no refresh until release above the threshold; the host callback
owns the actual action. Only the DSH adapter knows DSH selectors or PWA eligibility.

The renderer contract is a factory `({ host, onCancel }) => ({ update(state), destroy() })`.
The state includes `distance`, unbounded `progress`, `direction`, `reversing`,
`phase` (`hidden`, `pulling`, `armed`, `pending`, `cancelling`, `refreshing`) and `overdrag`. Renderers own and remove
their DOM. An optional `retreat(onComplete)` plays cancellation feedback; the
feature has already cancelled its timer before invoking it. They do not register gestures, persist settings or reload the page.
The whale renderer uses a viewport overlay and Shadow DOM to isolate SVG IDs and
CSS. Use a host outside transformed/clipped ancestors, normally `document.body`.

## DSH behavior and acceptance

The DSH adapter enables refresh only in a narrow PWA with a collapsed sidebar.
The leftmost 64px stay with the sidebar gesture. Composer, form controls, buttons,
links and editable areas do not initiate refresh. Reduced-motion users receive
the text renderer. The DSH adapter uses a 216px refresh threshold: twice the physical drag produces
the same animation progress as the archived 108px demo. All visual stages scale
together; the reusable module default and archived demo remain unchanged.

The renderer preserves the archived demo's sea reveal, eyes, fountain, reverse
drop hiding and 94–100% final-frame cycle. At progress 138% the prompt starts
moving and scaling; from 200% to 280% it fades out. Progress follows drag distance,
not elapsed time. The fixed animation layer does not transform the real conversation
or composer. Their movement under native overscroll requires device acceptance.

Verify on an actual iOS/Android PWA: scroll-bottom eligibility, forward/reverse
animation, native bounce, composer and keyboard, cancellation, disabling while
armed, one reload per release, and sidebar operation while refresh is disabled.
Automated tests validate lifecycle and frame state; they do not establish physical
touch or native overscroll behavior.

Build embeds the same module functions into the self-contained DSH client and
copies their ESM sources into `dist/features`. There are no runtime package fetches.
The archived standalone HTML remains a fixed visual reference, not build input.
