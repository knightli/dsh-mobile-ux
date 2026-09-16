# Mobile UX design record

## Source-of-truth boundary

The browser entry is `dist/client.js`. Its only durable responsibilities are:

1. register the module using DSH's `window.__ModuleLoader__.load({ id, factory })` contract;
2. wait for the semantic layout/conversation hooks to appear;
3. inject one owned style element when the hooks are compatible;
4. publish `globalThis.__DSH_MOBILE_UX__` as `waiting`, `compatible`, or `incompatible`.

The factory receives one `require` argument and returns `module.exports`; this is the DSH client-module materialization contract. No React tree, event handler, sidebar state, or DOM rearrangement is introduced by this plugin.

## Reference behavior adopted

The reference `dsh-mobile-ux` implementation establishes the useful narrow-screen behavior: collapse the three-column grid, position the sidebar as an overlay, keep a compact collapsed pill, add a layer between the drawer and main content, remove drag handles, and tighten conversation/composer gutters.

This implementation keeps those behaviors but changes the selector contract to stable attributes and semantic suffixes. It deliberately does not copy generated class hashes.

## Deliberate differences

| Reference behavior | Decision | Reason |
| --- | --- | --- |
| Hide the whole header on narrow screens | Keep the header | Mobile navigation and session context remain useful; hiding it is product-specific rather than required by the shell contract. |
| Details column gets an independent mobile drawer | Exclude | The requested scope is the sidebar/main shell. Adding another state owner would turn a CSS adaptation into a UI feature. The narrow grid still reserves an explicit details track at column 3. |
| Generated CSS-module selectors | Exclude | Hashes drift with builds and cannot be a compatibility contract. |
| JavaScript layout manipulation | Exclude | CSS owns geometry; `client.js` only gates style injection on observed hooks. |
| Session log text on narrow screens | Hide only the text span and keep the download SVG | The semantic button suffix remains the selector contract; runtime adds an accessible name only when the host did not provide one. |
| Desktop status placement | Reflow only when `[data-desktop-status]` exists | The hook is optional, so builds without desktop status keep their normal header layout. |
| Keyboard/address-bar viewport changes | Use `100dvh` and `env(safe-area-inset-bottom, 0px)` | This keeps the composer seat inside the dynamic viewport without adding a `visualViewport` state owner. |

## Installation control plane

The package has one generic `dsh-web` compatibility manifest. It describes a DSH home containing the `profiles/<profile>` directory, the shared flat `profiles/node_modules` directory, and the home-level `cordis.patch.yml`. The default profile is `web`; the CLI can parameterize the profile name without adding a second product target.

The managed patch uses an `insert` row for the package and the package link is placed under `<home>/profiles/node_modules`. A launcher may regenerate files under `<home>/profiles/<profile>`, so those files are not the persistence boundary.

Compatibility is checked before either managed output is written. The check is intentionally conservative: a missing artifact or missing semantic token blocks installation rather than applying CSS to an unknown shell.
