import { useEffect, useRef, useState } from 'preact/hooks';
import type { Settings } from '../hooks/useSettings';
import { t } from '../i18n';

interface Props {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

function GearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function SettingsPopover({ settings, setSetting }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        className="settings-gear"
        title={t('settingsTitle')}
        aria-label={t('settingsTitle')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <GearIcon />
      </button>
      {open && (
        <div className="settings-popover" role="dialog" aria-label={t('settingsTitle')}>
          <label className="settings-row">
            <input
              type="checkbox"
              checked={settings.showCopyIcons}
              onChange={(e) =>
                setSetting('showCopyIcons', (e.target as HTMLInputElement).checked)
              }
            />
            <span>{t('settingsShowCopyIcons')}</span>
          </label>
          <label className="settings-row">
            <input
              type="checkbox"
              checked={settings.showFilterBar}
              onChange={(e) =>
                setSetting('showFilterBar', (e.target as HTMLInputElement).checked)
              }
            />
            <span>{t('settingsShowFilterBar')}</span>
          </label>
          {settings.showFilterBar && (
            <label className="settings-row">
              <span>{t('settingsFilterBy')}</span>
              <select
                value={settings.filterBy}
                onChange={(e) =>
                  setSetting(
                    'filterBy',
                    (e.target as HTMLSelectElement).value as typeof settings.filterBy,
                  )
                }
              >
                <option value="name">{t('settingsFilterByName')}</option>
                <option value="value">{t('settingsFilterByValue')}</option>
                <option value="name-value">{t('settingsFilterByNameValue')}</option>
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
