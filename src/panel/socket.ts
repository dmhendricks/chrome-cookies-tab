import type { Cookie } from '../background/cookie-service';

export type IncomingCommand =
  | 'cookies:read'
  | 'cookies:create'
  | 'cookies:update'
  | 'cookies:delete'
  | 'removeAllCookies'
  | 'navigate';

export interface IncomingMessage {
  command: IncomingCommand;
  data?: unknown;
}

export interface OutgoingMessage {
  command: string;
  tabId: number;
  data?: unknown;
}

type Listener = (data: unknown) => void;

export class Socket {
  readonly tabId: number;
  private port: chrome.runtime.Port;
  private listeners = new Map<string, Set<Listener>>();

  constructor(tabId: number) {
    this.tabId = tabId;
    this.port = this.connect();
  }

  private connect(): chrome.runtime.Port {
    const port = chrome.runtime.connect();
    port.onMessage.addListener((msg: IncomingMessage) => {
      const set = this.listeners.get(msg.command);
      if (set) for (const fn of set) fn(msg.data);
    });
    port.onDisconnect.addListener(() => {
      this.port = this.connect();
      this.send({ command: 'saveListener' });
    });
    return port;
  }

  on(command: IncomingCommand, fn: Listener): () => void {
    let set = this.listeners.get(command);
    if (!set) {
      set = new Set();
      this.listeners.set(command, set);
    }
    set.add(fn);
    return () => set!.delete(fn);
  }

  send(msg: Omit<OutgoingMessage, 'tabId'>): void {
    try {
      this.port.postMessage({ ...msg, tabId: this.tabId });
    } catch {
      this.port = this.connect();
      this.port.postMessage({ ...msg, tabId: this.tabId });
    }
  }

  saveListener(): void {
    this.send({ command: 'saveListener' });
  }

  read(): void {
    this.send({ command: 'cookies:read' });
  }

  create(cookie: Partial<Cookie> & { session?: boolean; hostOnly?: boolean }): void {
    this.send({ command: 'cookies:create', data: cookie });
  }

  remove(cookie: Cookie): void {
    this.send({ command: 'cookies:delete', data: cookie });
  }

  removeAll(): void {
    this.send({ command: 'removeAllCookies' });
  }

  import(cookies: Array<Partial<Cookie> & { session?: boolean; hostOnly?: boolean }>): void {
    this.send({ command: 'cookies:import', data: cookies });
  }

  update(
    previousAttributes: Cookie & { id?: number },
    changedAttributes: Partial<Cookie> & { session?: boolean; hostOnly?: boolean },
  ): void {
    this.send({
      command: 'cookies:update',
      data: { previousAttributes, changedAttributes },
    });
  }
}
