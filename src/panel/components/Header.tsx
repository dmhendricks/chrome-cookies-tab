import type { SortState, SortColumn } from '../types';
import { t } from '../i18n';

interface Col {
  key: SortColumn;
  labelKey: string;
}

const COLS: Col[] = [
  { key: 'name', labelKey: 'columnName' },
  { key: 'value', labelKey: 'columnValue' },
  { key: 'domain', labelKey: 'columnDomain' },
  { key: 'size', labelKey: 'columnSize' },
  { key: 'path', labelKey: 'columnPath' },
  { key: 'expires', labelKey: 'columnExpires' },
  { key: 'httpOnly', labelKey: 'columnHttpOnly' },
  { key: 'secure', labelKey: 'columnSecure' },
];

interface Props {
  widths: number[];
  sort: SortState | null;
  onSort: (col: SortColumn) => void;
}

export function Header({ widths, sort, onSort }: Props) {
  return (
    <div id="header">
      <table style={{ width: '100%', height: '100%' }}>
        <colgroup>
          {COLS.map((c, i) => (
            <col key={c.key} style={{ width: `${widths[i]}%` }} />
          ))}
          <col style={{ width: '14px' }} />
        </colgroup>
        <tbody>
          <tr>
            {COLS.map((c) => {
              const cls = sort?.column === c.key ? sort.dir : '';
              return (
                <th
                  key={c.key}
                  data-col={c.key}
                  className={cls}
                  onClick={() => onSort(c.key)}
                >
                  <div>{t(c.labelKey)}</div>
                </th>
              );
            })}
            <th className="corner"></th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export { COLS };
