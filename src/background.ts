interface PortMessage {
  command: string;
  tabId: number;
  data?: {
    name?: string;
    value?: string;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    hostOnly?: boolean;
    session?: boolean;
    expirationDate?: number;
    changedAttributes?: Record<string, unknown>;
    previousAttributes?: Record<string, unknown>;
  };
}

const listeners: Record<number, chrome.runtime.Port> = {};

function onDOMContentLoaded(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
  if (details.frameId !== 0) {
    return;
  }

  const tabId = details.tabId;
  const port = listeners[tabId];
  if (port) {
    chrome.tabs.get(tabId, (tab) => {
      chrome.cookies.getAll({ url: tab.url ?? '' }, (cookies) => {
        port.postMessage({ command: 'cookies:read', data: { cookies } });
      });
    });
  }
}

function onNavigate(details: chrome.webNavigation.WebNavigationBaseCallbackDetails) {
  // `frameId` is on the runtime payload but not the base type; cast to read it.
  const frameId = (details as { frameId?: number }).frameId;
  if (frameId !== 0) {
    return;
  }

  const tabId = details.tabId;
  const port = listeners[tabId];
  if (port) {
    port.postMessage({ command: 'navigate' });
  }
}

function onPortMessageReceived(msg: PortMessage, port: chrome.runtime.Port) {
  const tabId = msg.tabId;
  const command = msg.command;

  if (command === 'saveListener') {
    listeners[tabId] = port;

    port.onDisconnect.addListener(() => {
      delete listeners[tabId];
    });
  }

  if (command === 'removeAllCookies') {
    chrome.tabs.get(tabId, (tab) => {
      const url = tab.url ?? '';
      chrome.cookies.getAll({ url }, (cookies) => {
        for (let i = 0; i < cookies.length; i += 1) {
          chrome.cookies.remove({ url, name: cookies[i]!.name });
        }
        port.postMessage({ command, data: { cookies: [] } });
      });
    });
  }

  if (command === 'cookies:read') {
    chrome.tabs.get(tabId, (tab) => {
      chrome.cookies.getAll({ url: tab.url ?? '' }, (cookies) => {
        port.postMessage({ command, data: { cookies } });
      });
    });
  }

  if (command === 'cookies:create') {
    const data = msg.data!;

    chrome.tabs.get(tabId, (tab) => {
      const details: chrome.cookies.SetDetails = {
        url: tab.url ?? '',
        name: data.name,
        value: data.value,
        path: data.path,
        secure: data.secure,
        httpOnly: data.httpOnly,
      };

      if (!data.hostOnly) {
        details.domain = data.domain;
      }
      if (!data.session) {
        details.expirationDate = data.expirationDate;
      }

      chrome.cookies.set(details, (cookie) => {
        port.postMessage({ command, data: cookie });
      });
    });
  }

  if (command === 'cookies:delete') {
    const data = msg.data!;

    chrome.tabs.get(tabId, (tab) => {
      const details = {
        url: tab.url ?? '',
        name: data.name!,
      };

      chrome.cookies.remove(details, (cookie) => {
        port.postMessage({ command, data: cookie });
      });
    });
  }

  if (command === 'cookies:update') {
    const changedAttributes = msg.data?.changedAttributes as Record<string, unknown> | undefined;
    const previousAttributes = msg.data?.previousAttributes as Record<string, unknown> | undefined;

    if (changedAttributes && previousAttributes) {
      chrome.tabs.get(tabId, (tab) => {
        const url = tab.url ?? '';
        chrome.cookies.remove({ url, name: previousAttributes.name as string }, () => {
          const details: chrome.cookies.SetDetails = {
            url,
            name: (changedAttributes.name as string) || (previousAttributes.name as string),
            value: (changedAttributes.value as string) || (previousAttributes.value as string),
            path: (changedAttributes.path as string) || (previousAttributes.path as string),
          };

          // `secure` attribute
          if (changedAttributes.secure === undefined) {
            details.secure = previousAttributes.secure as boolean;
          } else {
            details.secure = changedAttributes.secure as boolean;
          }

          // `httpOnly` attribute
          if (changedAttributes.httpOnly === undefined) {
            details.httpOnly = previousAttributes.httpOnly as boolean;
          } else {
            details.httpOnly = changedAttributes.httpOnly as boolean;
          }

          // If it's undefined, it means that the `hostOnly` value
          // did not get changed, therefore, get the previous value.
          if (changedAttributes.hostOnly === undefined) {
            if (previousAttributes.hostOnly === false) {
              details.domain =
                (changedAttributes.domain as string) || (previousAttributes.domain as string);
            }
          } else {
            if (changedAttributes.hostOnly === false) {
              details.domain =
                (changedAttributes.domain as string) || (previousAttributes.domain as string);
            }
          }

          // `expirationDate` attribute
          const isSessionChanged = changedAttributes.session !== undefined;
          if (isSessionChanged) {
            if (changedAttributes.session) {
              details.expirationDate = undefined;
            } else {
              details.expirationDate = changedAttributes.expirationDate as number;
            }
          } else {
            details.expirationDate =
              (changedAttributes.expirationDate as number) ||
              (previousAttributes.expirationDate as number);
          }

          chrome.cookies.set(details, (cookie) => {
            const enriched = cookie as chrome.cookies.Cookie & { id?: unknown };
            enriched.id = previousAttributes.id;
            port.postMessage({ command, data: enriched });
          });
        });
      });
    }
  }
}

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg: PortMessage) => {
    onPortMessageReceived(msg, port);
  });
});

chrome.webNavigation.onDOMContentLoaded.addListener(onDOMContentLoaded);
chrome.webNavigation.onBeforeNavigate.addListener(onNavigate);
