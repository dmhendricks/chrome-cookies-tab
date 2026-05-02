# Cookie Tab in DevTools

A cookie manager for Google Chrome. Edit and create cookies right
in the Developer Tools. Forked from [westoque/cookie_inspector](https://github.com/westoque/cookie_inspector). Now with proper dark mode support!

![Cookie Tab in DevTools Screenshot](store/screenshot-1280x800-01.png)

Features:

- View, Add, Edit, Remove Cookies
- Live Reloading (No need to close and open the inspector when you change URLs)
- Export Cookies

## Installation

1. Download `chrome-cookie-tab.zip` from the [latest release](https://github.com/dmhendricks/chrome-cookie-tab/releases/latest) and unzip it somewhere you'll remember.
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

## Architecture

```
┌──────────────────────────┐         ┌────────────────────────────┐
│ DevTools panel (Preact)  │ ──────▶ │ Background service worker  │
│  src/panel/              │  port   │  src/background.ts          │
│  - App.tsx               │ ◀────── │  - CookieService            │
│  - useCookies hook       │ events  │  - chrome.cookies.onChanged │
└──────────────────────────┘         └────────────────────────────┘
```

- **Devtools page** ([src/devtools/](src/devtools/)) registers the panel via `chrome.devtools.panels.create`.
- **Panel** ([src/panel/](src/panel/)) is a Preact app that opens a long-lived `chrome.runtime.connect` port to the service worker, keyed by inspected `tabId`. State is recomputed from `chrome.cookies` on demand — nothing is persisted.
- **Service worker** ([src/background.ts](src/background.ts)) is a thin dispatcher over [CookieService](src/background/cookie-service.ts). It listens to `chrome.cookies.onChanged` and `chrome.webNavigation.onDOMContentLoaded` and pushes updates back over the port. The port is rebuilt on demand if the SW idles.
- **Build**: Vite + `@crxjs/vite-plugin` produce `dist/` from [src/manifest.json](src/manifest.json).

### Permissions

- `cookies`, `tabs`, `webNavigation` — required for reading/writing cookies and refreshing the panel on navigation.
- Host permission `*://*/*` — DevTools must read cookies for whatever origin the user is inspecting, which is not known ahead of time. `activeTab` is not viable here because the panel needs persistent cookie access for the inspected tab across navigations and reloads, not a one-shot user-gesture grant.
