import { useMemo } from 'preact/hooks';
import type { SortColumn, SortState, UICookie } from '../types';
import { CookieRow } from './CookieRow';
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
  cookies: UICookie[];
  widths: number[];
  sort: SortState | null;
  onSort: (col: SortColumn) => void;
  showCopyIcons: boolean;
  selectedIds: Set<string>;
  onRowClick: (e: MouseEvent, c: UICookie) => void;
  onFillerClick: () => void;
  onRowContextMenu: (e: MouseEvent, c: UICookie) => void;
  onFillerContextMenu: (e: MouseEvent) => void;
  onRowDoubleClick: (c: UICookie) => void;
}

const FILLER_CELLS = Array.from({ length: 8 }, (_, i) => <td key={i}></td>);

export function Content({
  cookies,
  widths,
  sort,
  onSort,
  showCopyIcons,
  selectedIds,
  onRowClick,
  onFillerClick,
  onRowContextMenu,
  onFillerContextMenu,
  onRowDoubleClick,
}: Props) {
  const cols = useMemo(
    () => (
      <colgroup>
        {widths.map((w, i) => (
          <col key={i} style={{ width: `${w}%` }} />
        ))}
      </colgroup>
    ),
    [widths],
  );

  return (
    <div id="content">
      <table style={{ width: '100%' }}>
        {cols}
        <thead>
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
          </tr>
        </thead>
        <tbody>
          {cookies.map((c) => (
            <CookieRow
              key={c.id}
              cookie={c}
              showCopyIcons={showCopyIcons}
              selected={selectedIds.has(c.id)}
              onClick={onRowClick}
              onContextMenu={onRowContextMenu}
              onDoubleClick={onRowDoubleClick}
            />
          ))}
          <tr
            className="filler"
            onClick={onFillerClick}
            onContextMenu={(e) => onFillerContextMenu(e as unknown as MouseEvent)}
          >
            {FILLER_CELLS}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
