# Cookie Inspector

A cookie manager for Google Chrome. Edit and create cookies right
in the Developer Tools. Forked from [westoque/cookie_inspector](https://github.com/westoque/cookie_inspector).

Features:

- View, Add, Edit, Remove Cookies
- Live Reloading (No need to close and open the inspector when you change URLs)
- Export Cookies

## Installation

1. Download or clone this repository, then unzip it somewhere you'll remember.
2. Open Chrome and go to `chrome://extensions`.
3. In the top-right corner, turn on **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder inside the project.
5. Open DevTools on any page (right-click → Inspect, or F12). The **Cookies** tab should appear.

To update later, pull the latest changes and click the refresh icon on the extension's card in `chrome://extensions`.

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

## Design

```
  +--------+      +--------+      +-----------------+
  | Panel  |<---->| Socket |<---->| Service Worker  |
  +--------+      +--------+      +-----------------+
```

### Panel

The DevTools panel UI. Currently a Backbone.js + jQuery + Mustache app
(legacy, scheduled to be replaced with Preact + TypeScript — see
[docs/modernization-plan.md](docs/modernization-plan.md)).

### Socket

An object that mediates between the panel and the service worker via a
long-lived `chrome.runtime` port.

### Service Worker

`src/background.ts` (TypeScript). Handles cookie reads/writes via the
`chrome.cookies` API and pushes updates back to the panel.

## License

MIT
