import { SettingsPopover } from './SettingsPopover';
import type { Settings } from '../hooks/useSettings';

interface Props {
  count: number;
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function Footer({ count, settings, setSetting }: Props) {
  return (
    <div id="footer">
      <div id="cookies-count-container">
        Total cookies: <span id="cookies-count">{count}</span>
      </div>
      <SettingsPopover settings={settings} setSetting={setSetting} />
    </div>
  );
}
