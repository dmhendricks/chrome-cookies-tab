import { useEffect, useState, useCallback } from 'preact/hooks';

export interface Settings {
  showCopyIcons: boolean;
  showFilterBar: boolean;
}

const DEFAULTS: Settings = {
  showCopyIcons: true,
  showFilterBar: true,
};

const KEYS = Object.keys(DEFAULTS) as (keyof Settings)[];

function resolve(raw: Record<string, unknown>): Settings {
  const out = { ...DEFAULTS };
  for (const key of KEYS) {
    const v = raw[key];
    if (typeof v === 'boolean') out[key] = v;
  }
  return out;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    chrome.storage.sync.get(KEYS, (raw) => {
      setSettings(resolve(raw));
    });
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== 'sync') return;
      setSettings((prev) => {
        const next = { ...prev };
        for (const key of KEYS) {
          if (key in changes) {
            const v = changes[key]?.newValue;
            next[key] = typeof v === 'boolean' ? v : DEFAULTS[key];
          }
        }
        return next;
      });
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    chrome.storage.sync.set({ [key]: value });
  }, []);

  return { settings, setSetting };
}
