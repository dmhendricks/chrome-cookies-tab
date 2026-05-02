# Cookie Tab in DevTools Changelog

### Release 2.2.0

- Rewrite the DevTools panel UI in Preact + JSX, replacing Backbone, jQuery, Underscore, Mustache, and Hogan. Delete `lib/`.
- Convert panel CSS to SCSS with CSS variable theming.
- Add a **Refresh** entry to the cookie context menu ([#12](https://github.com/westoque/cookie_inspector/issues/12)) for cases where `chrome.cookies.onChanged` doesn't fire.
- Add hover-to-copy affordance on cookie name and value cells ([#5](https://github.com/westoque/cookie_inspector/issues/5)).
- Drop redundant `http://*/*` and `https://*/*` host permissions (covered by `*://*/*`).
- Drop unused `unlimitedStorage` permission.
- Bump `minimum_chrome_version` to 116.
- README: add architecture overview and document the host-permission decision.

### Release 2.1.0

- Add a Vite + `@crxjs/vite-plugin` build pipeline; introduce TypeScript (strict), ESLint flat config, Prettier, and Vitest. Move sources under `src/`.
- Convert `background.js`, `devtools-page.js`, `socket.js`, and `ci.js` to TypeScript with `const`/`let` and promise-form `chrome.*` APIs.
- Harden the MV3 service worker: extract a typed `CookieService`, treat the devtools port as rebuildable across SW idle, and stop relying on the in-memory `listeners` map surviving suspension.
- Fix `cookies:update` to preserve the full attribute set (`sameSite`, `storeId`, partition keys) instead of dropping them on `remove` + `set`.

### Release 2.0.8

- Add Dark Theme (thanks to @clarketm)

### Release 2.0.7

- Bump version to sync with Chrome Web Store version.

### Release 2.0.5

- [#10](https://github.com/westoque/cookie_inspector/pull/10) Narrow down manifest permissions
- [#6](https://github.com/westoque/cookie_inspector/pull/6) Double click cookie row to bring up editing pane


marzanaaron@gmail.com
