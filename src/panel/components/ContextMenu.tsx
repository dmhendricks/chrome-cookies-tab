import { useEffect, useRef } from 'preact/hooks';

export interface ContextMenuActions {
  onAddNew: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onRemoveAll: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
}

interface Props {
  x: number;
  y: number;
  isInRow: boolean;
  actions: ContextMenuActions;
  onDismiss: () => void;
}

export function ContextMenu({ x, y, isInRow, actions, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

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
      <div id="context-menu-body" style={{ top: y, left: x }}>
        {item('add-new-cookie', 'Add New Cookie', actions.onAddNew)}
        {isInRow && (
          <>
            {item('edit-cookie', 'Edit Cookie', actions.onEdit)}
            {item('remove-cookie', 'Remove Cookie', actions.onRemove)}
          </>
        )}
        <div className="context-menu-item-separator"></div>
        {item('remove-all-cookies', 'Remove All Cookies', actions.onRemoveAll)}
        {item('refresh-cookies', 'Refresh', actions.onRefresh)}
        <div className="context-menu-item-separator"></div>
        {item('export-all-cookies', 'Export All Cookies', actions.onExport)}
        {item('import-all-cookies', 'Import Cookies', actions.onImport)}
      </div>
    </div>
  );
}
