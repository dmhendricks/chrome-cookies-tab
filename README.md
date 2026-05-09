# Cookies Tab in DevTools

This Chrome extension allows you to easily browse, filter and modify cookies via a custom tab in Chrome Developer Tools. Multi-select rows for bulk delete or export, copy values with one click, and fetch a fresh cookie list automatically as you navigate. Forked from [westoque/cookie_inspector](https://github.com/westoque/cookie_inspector) and modernized.

![Cookies Tab in DevTools Screenshot](store/screenshot-1280x550.png)

Features:

- View, add, edit, filter and delete cookies
- Live reloading (no need to close and open the inspector when you change URLs)
- Import and export cookies

## Installation

The easiest way to install the extension is from the [Chrome Web Store](https://chromewebstore.google.com/detail/cookies-tab-in-devtools/nifkepndinooddpphmpmlkimamhbjdhd).

Alternatively, you can install from the ZIP file:

1. Download `chrome-cookies-tab.zip` from the [latest release](https://github.com/dmhendricks/chrome-cookies-tab/releases/latest) and unzip it somewhere you'll remember.
2. Open Chrome and go to `chrome://extensions`.
3. In the top-right corner, turn on **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder.
5. Open DevTools on any page (right-click → Inspect, or F12). The **Cookies** tab should appear.

To update later, download the new release zip, replace the unzipped folder's contents, and click the refresh icon on the extension's card in `chrome://extensions`.

## Development

Requires Node 20+.

```
npm install
npm run dev      # watch build, auto-reloads the extension
npm run build    # production build → dist/
npm run typecheck
npm run lint
```

Load the extension in Chrome from `chrome://extensions` → **Load unpacked** → select `dist/`.

## Translations

The extension uses Chrome's built-in [`chrome.i18n`](https://developer.chrome.com/docs/extensions/reference/api/i18n) API. Adding a new language is a single drop-in JSON file — no code changes.

Initial translations were done by AI, so if you spot an error or improvement, please report it. To contribute a translation:

1. Copy [`public/_locales/en/messages.json`](public/_locales/en/messages.json) to `public/_locales/<lang>/messages.json`, where `<lang>` is a [Chrome-supported locale code](https://developer.chrome.com/docs/extensions/reference/api/i18n#supported-locales) (`es`, `fr`, `de`, `ja`, `pt_BR`, …).
2. Translate the `message` fields. Leave the keys, `description` fields, and `placeholders` blocks untouched — `description` is for translator context, and placeholders like `$COUNT$` are substituted at runtime by Chrome.
3. Submit a pull request.

Missing keys fall back to English automatically.
