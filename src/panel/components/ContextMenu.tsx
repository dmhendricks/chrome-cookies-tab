import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { t } from '../i18n';

export interface ContextMenuActions {
  onAddNew: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onRemoveAll: () => void;
  onExport: () => void;
  onExportSelected: () => void;
  onImport: () => void;
  onRefresh: () => void;
}

interface Props {
  x: number;
  y: number;
  isInRow: boolean;
  selectedCount: number;
  actions: ContextMenuActions;
  onDismiss: () => void;
}

export function ContextMenu({ x, y, isInRow, selectedCount, actions, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: y, left: x });

  useLayoutEffect(() => {
    ref.current?.focus();
    const body = bodyRef.current;
    if (!body) return;
    const { offsetWidth: w, offsetHeight: h } = body;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 4;
    let left = x;
    let top = y;
    if (left + w + margin > vw) left = Math.max(margin, x - w);
    if (left + w + margin > vw) left = Math.max(margin, vw - w - margin);
    if (top + h + margin > vh) top = Math.max(margin, y - h);
    if (top + h + margin > vh) top = Math.max(margin, vh - h - margin);
    setPos({ top, left });
  }, [x, y]);

  const item = (id: string, label: string, fn: () => void) => (
    <div
      id={id}
      className="context-menu-item"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fn();
        onDismiss();
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      id="context-menu-view"
      ref={ref}
      tabIndex={0}
      onBlur={onDismiss}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onDismiss();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onDismiss();
      }}
    >
      <div id="context-menu-body" ref={bodyRef} style={{ top: pos.top, left: pos.left }}>
        {item('add-new-cookie', t('menuAddNew'), actions.onAddNew)}
        {isInRow && selectedCount === 1 &&
          item('edit-cookie', t('menuEdit'), actions.onEdit)}
        {item('refresh-cookies', t('menuRefresh'), actions.onRefresh)}
        <div className="context-menu-item-separator"></div>
        {selectedCount === 1 && isInRow &&
          item('remove-cookie', t('menuDelete'), actions.onRemove)}
        {selectedCount > 1 &&
          item(
            'remove-cookie',
            t('menuDeleteSelected', String(selectedCount)),
            actions.onRemove,
          )}
        {item('remove-all-cookies', t('menuDeleteAll'), actions.onRemoveAll)}
        <div className="context-menu-item-separator"></div>
        {selectedCount > 0 &&
          item(
            'export-selected-cookies',
            t('menuExportSelected', String(selectedCount)),
            actions.onExportSelected,
          )}
        {item('export-all-cookies', t('menuExportAll'), actions.onExport)}
        {item('import-all-cookies', t('menuImport'), actions.onImport)}
      </div>
    </div>
  );
}
