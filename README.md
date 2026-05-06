# Cookies Tab in DevTools

A cookie manager for Google Chrome. Edit and create cookies right
in the Developer Tools. Forked from [westoque/cookie_inspector](https://github.com/westoque/cookie_inspector) and modernized.

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
