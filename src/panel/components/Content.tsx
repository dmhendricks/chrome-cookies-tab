import { useMemo } from 'preact/hooks';
import type { UICookie } from '../types';
import { CookieRow } from './CookieRow';

interface Props {
  cookies: UICookie[];
  widths: number[];
  showCopyIcons: boolean;
  onRowContextMenu: (e: MouseEvent, c: UICookie) => void;
  onFillerContextMenu: (e: MouseEvent) => void;
  onRowDoubleClick: (c: UICookie) => void;
}

const FILLER_CELLS = Array.from({ length: 9 }, (_, i) => <td key={i}></td>);

export function Content({
  cookies,
  widths,
  showCopyIcons,
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
        <col style={{ width: '14px' }} />
      </colgroup>
    ),
    [widths],
  );

  return (
    <div id="content">
      <table style={{ width: '100%', height: '100%' }}>
        {cols}
        <tbody>
          {cookies.map((c) => (
            <CookieRow
              key={c.id}
              cookie={c}
              showCopyIcons={showCopyIcons}
              onContextMenu={onRowContextMenu}
              onDoubleClick={onRowDoubleClick}
            />
          ))}
          <tr
            className="filler"
            onContextMenu={(e) => onFillerContextMenu(e as unknown as MouseEvent)}
          >
            {FILLER_CELLS}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
