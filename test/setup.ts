// Minimal chrome shim so modules that touch chrome.* at import time can load.
(globalThis as unknown as { chrome: unknown }).chrome = {
  i18n: {
    getUILanguage: () => 'en-US',
    getMessage: (key: string) => key,
  },
};
