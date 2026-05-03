import { CookieService, type CookieFormInput, type UpdatePayload } from './background/cookie-service';

interface PortMessage {
  command: string;
  tabId: number;
  data?: CookieFormInput &
    Partial<UpdatePayload> & {
      // legacy: server-side ignored; preserved for forward-compat
      [key: string]: unknown;
    };
}

/**
 * Map of tabId → connected devtools port. Lost when the SW suspends; that's
 * fine — the panel reconnects and re-sends `saveListener` on resume.
 */
const ports = new Map<number, chrome.runtime.Port>();

function send(port: chrome.runtime.Port, command: string, data: unknown): void {
  try {
    port.postMessage({ command, data });
  } catch {
    // Port disconnected between request and response. The panel will reconnect.
  }
}

async function handle(msg: PortMessage, port: chrome.runtime.Port): Promise<void> {
  const { command, tabId } = msg;

  switch (command) {
    case 'saveListener': {
      ports.set(tabId, port);
      port.onDisconnect.addListener(() => {
        if (ports.get(tabId) === port) ports.delete(tabId);
      });
      return;
    }

    case 'cookies:read': {
      const cookies = await CookieService.list(tabId);
      send(port, command, { cookies });
      return;
    }

    case 'cookies:create': {
      const cookie = await CookieService.create(tabId, msg.data ?? {});
      send(port, command, cookie);
      return;
    }

    case 'cookies:delete': {
      await CookieService.delete(tabId, msg.data?.name ?? '');
      send(port, command, msg.data);
      return;
    }

    case 'cookies:update': {
      const data = msg.data;
      if (!data?.previousAttributes || !data.changedAttributes) return;
      const cookie = await CookieService.update(tabId, {
        previousAttributes: data.previousAttributes,
        changedAttributes: data.changedAttributes,
      });
      const enriched = cookie
        ? { ...cookie, id: (data.previousAttributes as { id?: unknown }).id }
        : null;
      send(port, command, enriched);
      return;
    }

    case 'removeAllCookies': {
      await CookieService.removeAll(tabId);
      send(port, command, { cookies: [] });
      return;
    }
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.sender?.id !== chrome.runtime.id) return;
  port.onMessage.addListener((msg: PortMessage) => {
    void handle(msg, port);
  });
});

chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const port = ports.get(details.tabId);
  if (!port) return;
  const cookies = await CookieService.list(details.tabId);
  send(port, 'cookies:read', { cookies });
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  const port = ports.get(details.tabId);
  if (!port) return;
  send(port, 'navigate', undefined);
});
