import type { FilterBy } from '../hooks/useSettings';
import { t } from '../i18n';

interface Props {
  value: string;
  filterBy: FilterBy;
  onChange: (value: string) => void;
}

const PLACEHOLDER_KEYS: Record<FilterBy, string> = {
  name: 'filterPlaceholderName',
  value: 'filterPlaceholderValue',
  'name-value': 'filterPlaceholderNameValue',
};

export function FilterBar({ value, filterBy, onChange }: Props) {
  return (
    <div id="filter-bar">
      <input
        type="search"
        className="filter-input"
        placeholder={t(PLACEHOLDER_KEYS[filterBy])}
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  );
}
