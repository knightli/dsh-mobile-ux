# Mobile UX design record

## Source-of-truth boundary

The browser entry is `dist/client.js`. Its only durable responsibilities are:

1. register the module using DSH's `window.__ModuleLoader__.load({ id, factory })` contract;
2. wait for the semantic layout/conversation hooks to appear;
3. inject one owned style element when the hooks are compatible;
4. bind the PWA-only sidebar gestures to the existing semantic toggle;
5. bind the PWA-only bottom pull-to-refresh gesture to the conversation scroll boundary;
6. publish `globalThis.__DSH_MOBILE_UX__` as `waiting`, `compatible`, or `incompatible`.

The factory receives one `require` argument and returns `module.exports`; this is the DSH client-module materialization contract. The plugin does not create a React tree, own sidebar state, or rearrange the layout. Its small browser event handler invokes the existing sidebar toggle after a qualifying PWA swipe, owns a switchable pull-refresh module with an ephemeral renderer, and reloads the page only after an armed bottom pull is released.

## Reference behavior adopted

The reference `dsh-mobile-ux` implementation establishes the useful narrow-screen behavior: collapse the three-column grid, position the sidebar as an overlay, keep a compact collapsed pill, add a layer between the drawer and main content, remove drag handles, and tighten conversation/composer gutters.

This implementation keeps those behaviors but changes the selector contract to stable attributes and semantic suffixes. It deliberately does not copy generated class hashes.

## Deliberate differences

| Reference behavior | Decision | Reason |
| --- | --- | --- |
| Hide the whole header on narrow screens | Keep the header | Mobile navigation and session context remain useful; hiding it is product-specific rather than required by the shell contract. |
| Details column gets an independent mobile drawer | Exclude | The requested scope is the sidebar/main shell. Adding another state owner would turn a CSS adaptation into a UI feature. The narrow grid still reserves an explicit details track at column 3. |
| Generated CSS-module selectors | Exclude | Hashes drift with builds and cannot be a compatibility contract. |
| JavaScript layout manipulation or state ownership | Exclude | CSS owns geometry; the browser entry only invokes the existing toggle and does not recreate layout or sidebar state. |
| PWA sidebar swipe gestures | Include | A left-edge right swipe opens the existing sidebar toggle; a left swipe inside an open sidebar closes it. The handler does not call `preventDefault()`, alter history, or persist an open intent, so iOS history navigation may occur concurrently. |
| PWA bottom pull-to-refresh | Include | When the conversation scroll is at its bottom boundary, an upward pull renders the whale animation (or text for reduced motion). Releasing after the trigger distance calls the normal page reload; reversing the pull retracts the prompt. Composer, form controls, buttons, and links are excluded. |
| Session log on narrow screens | Hide the whole download button | The semantic button suffix remains the selector contract, while the mobile shell keeps header space for navigation and title context. |
| Sidebar toggle tooltip | Hide only a `role="tooltip"` sibling of the semantic sidebar toggle | The upstream Tooltip renders that bubble beside the toggle; scoping the rule to the sidebar prevents unrelated business tooltips from disappearing. |
| Header/title/tabs placement | Keep the title row single-line and let tabs scroll horizontally | The generic shell contract does not infer or position product-specific status widgets. |
| Keyboard/address-bar viewport changes | Use `100dvh` and `env(safe-area-inset-bottom, 0px)` | The composer seat owns the bottom safe-area padding; the conversation scroll body only subtracts the inset from its height cap, avoiding double bottom whitespace without adding a `visualViewport` state owner. |

## Installation control plane

The package has one generic `dsh-web` compatibility manifest. It describes a DSH home containing the `profiles/<profile>` directory, the shared flat `profiles/node_modules` directory, and the home-level `cordis.patch.yml`. The default profile is `web`; the CLI can parameterize the profile name without adding a second product target.

The managed patch uses an `insert` row for the package and the package link is placed under `<home>/profiles/node_modules`. A launcher may regenerate files under `<home>/profiles/<profile>`, so those files are not the persistence boundary.

Compatibility is checked before either managed output is written. The check is intentionally conservative: a missing artifact or missing semantic token blocks installation rather than applying CSS to an unknown shell.

## Pull-refresh module

See [pull-refresh.md](pull-refresh.md) for the reusable module interface, settings lifecycle, renderer contract and device acceptance boundary.
