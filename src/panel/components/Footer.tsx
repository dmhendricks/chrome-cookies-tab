import { SettingsPopover } from './SettingsPopover';
import type { Settings } from '../hooks/useSettings';
import { t } from '../i18n';

interface Props {
  count: number;
  selectedCount: number;
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function Footer({ count, selectedCount, settings, setSetting }: Props) {
  return (
    <div id="footer">
      <div id="cookies-count-container">
        {t('footerTotalCookies')} <span id="cookies-count">{count}</span>
        {selectedCount >= 2 && (
          <>
            {' • '}
            {t('footerSelected')} <span id="selected-count">{selectedCount}</span>
          </>
        )}
      </div>
      <SettingsPopover settings={settings} setSetting={setSetting} />
    </div>
  );
}
