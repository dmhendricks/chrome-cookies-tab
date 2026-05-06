import { useEffect, useMemo, useState } from 'preact/hooks';
import * as v from 'valibot';
import { Header } from './components/Header';
import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { FilterBar } from './components/FilterBar';
import { ContextMenu } from './components/ContextMenu';
import { CookieForm, type FormValues } from './components/CookieForm';
import { Resizers } from './components/Resizers';
import { useCookies } from './hooks/useCookies';
import { useColumnResize } from './hooks/useColumnResize';
import { useSettings } from './hooks/useSettings';
import { buildExportFilename, sortCookies } from './util';
import { CookieImportSchema } from '../shared/cookie-schema';
import type { Socket } from './socket';
import type { SortColumn, SortState, UICookie } from './types';

interface MenuState {
  x: number;
  y: number;
  cookie: UICookie | null;
}

interface EditorState {
  initial: UICookie;
  isNew: boolean;
}

interface Props {
  socket: Socket;
}

export function App({ socket }: Props) {
  const { cookies, refresh, create, remove, removeMany, removeAll, update, importAll } =
    useCookies(socket);
  const { widths, resize } = useColumnResize();
  const { settings, setSetting } = useSettings();
  const [sort, setSort] = useState<SortState | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const sorted = useMemo(
    () => (sort ? sortCookies(cookies, sort.column, sort.dir) : cookies),
    [cookies, sort],
  );

  const visible = useMemo(() => {
    if (!settings.showFilterBar) return sorted;
    const q = filter.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => {
      switch (settings.filterBy) {
        case 'value':
          return c.value.toLowerCase().includes(q);
        case 'name-value':
          return c.name.toLowerCase().includes(q) || c.value.toLowerCase().includes(q);
        case 'name':
        default:
          return c.name.toLowerCase().includes(q);
      }
    });
  }, [sorted, settings.showFilterBar, settings.filterBy, filter]);

  useEffect(() => {
    document.body.classList.toggle('filter-bar-visible', settings.showFilterBar);
  }, [settings.showFilterBar]);

  useEffect(() => {
    const visibleIds = new Set(visible.map((c) => c.id));
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (visibleIds.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
    setAnchorId((prev) => (prev && visibleIds.has(prev) ? prev : null));
    setFocusId((prev) => (prev && visibleIds.has(prev) ? prev : null));
  }, [visible]);

  const clearSelection = () => {
    setSelectedIds(new Set());
    setAnchorId(null);
    setFocusId(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menu || editor) return;
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inEditable =
        tag === 'INPUT' || tag === 'TEXTAREA' || !!target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'a') {
        if (inEditable) return;
        e.preventDefault();
        setSelectedIds(new Set(visible.map((c) => c.id)));
        setAnchorId(visible[0]?.id ?? null);
        setFocusId(visible[visible.length - 1]?.id ?? null);
        return;
      }

      if (e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        if (inEditable) return;
        if (visible.length === 0) return;
        const ids = visible.map((c) => c.id);
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const curFocus = focusId && ids.includes(focusId) ? focusId : null;
        const curAnchor = anchorId && ids.includes(anchorId) ? anchorId : null;
        let nextFocusIdx: number;
        let nextAnchorId: string;
        if (curFocus && curAnchor) {
          const fi = ids.indexOf(curFocus);
          nextFocusIdx = Math.max(0, Math.min(ids.length - 1, fi + dir));
          nextAnchorId = curAnchor;
        } else {
          nextFocusIdx = dir === 1 ? 0 : ids.length - 1;
          nextAnchorId = ids[nextFocusIdx]!;
        }
        e.preventDefault();
        const ai = ids.indexOf(nextAnchorId);
        const [lo, hi] = ai < nextFocusIdx ? [ai, nextFocusIdx] : [nextFocusIdx, ai];
        setSelectedIds(new Set(ids.slice(lo, hi + 1)));
        setAnchorId(nextAnchorId);
        setFocusId(ids[nextFocusIdx]!);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, editor, visible, anchorId, focusId]);

  const onRowClick = (e: MouseEvent, cookie: UICookie) => {
    const additive = e.ctrlKey || e.metaKey;
    const range = e.shiftKey;
    if (range && anchorId) {
      const ids = visible.map((c) => c.id);
      const a = ids.indexOf(anchorId);
      const b = ids.indexOf(cookie.id);
      if (a === -1 || b === -1) {
        setSelectedIds(new Set([cookie.id]));
        setAnchorId(cookie.id);
        setFocusId(cookie.id);
        return;
      }
      const [lo, hi] = a < b ? [a, b] : [b, a];
      setSelectedIds(new Set(ids.slice(lo, hi + 1)));
      setFocusId(cookie.id);
      return;
    }
    if (additive) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(cookie.id)) next.delete(cookie.id);
        else next.add(cookie.id);
        return next;
      });
      setAnchorId(cookie.id);
      setFocusId(cookie.id);
      return;
    }
    setSelectedIds(new Set([cookie.id]));
    setAnchorId(cookie.id);
    setFocusId(cookie.id);
  };

  const onSort = (col: SortColumn) => {
    setSort((prev) => {
      if (!prev || prev.column !== col) return { column: col, dir: 'asc' };
      return { column: col, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  const openMenuFor = (e: MouseEvent, cookie: UICookie | null) => {
    e.stopPropagation();
    e.preventDefault();
    if (cookie) {
      if (selectedIds.size < 2 && !selectedIds.has(cookie.id)) {
        setSelectedIds(new Set([cookie.id]));
        setAnchorId(cookie.id);
        setFocusId(cookie.id);
      }
    } else {
      clearSelection();
    }
    setMenu({ x: e.clientX, y: e.clientY, cookie });
  };

  const openEditorFor = (cookie: UICookie, isNew = false) => {
    setEditor({ initial: cookie, isNew });
  };

  const onAddNew = () => {
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    chrome.tabs.get(socket.tabId, (tab) => {
      let domain = '';
      const url = tab?.url;
      if (url) {
        try {
          domain = new URL(url).hostname;
        } catch {
          domain = '';
        }
      }
      const cookie: UICookie = {
        id: '',
        domain,
        expirationDate: oneYear.getTime() / 1000,
        hostOnly: false,
        httpOnly: false,
        name: 'Cookie',
        path: '/',
        secure: false,
        session: false,
        value: 'Value',
        sameSite: 'unspecified',
        storeId: '',
      };
      openEditorFor(cookie, true);
    });
  };

  const onSubmitForm = (values: FormValues) => {
    if (!editor) return;
    if (editor.isNew) {
      create(values);
    } else {
      update(editor.initial, values);
    }
    setEditor(null);
  };

  const exportCookies = (toExport: UICookie[]) => {
    chrome.tabs.get(socket.tabId, (tab) => {
      const a = document.createElement('a');
      const blob = new Blob([JSON.stringify(toExport, null, '  ')]);
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = buildExportFilename(tab?.url);
      a.click();
    });
  };

  const onExport = () => exportCookies(cookies);
  const onExportSelected = () =>
    exportCookies(visible.filter((c) => selectedIds.has(c.id)));

  const onImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const fr = new FileReader();
      fr.addEventListener('loadend', () => {
        let raw: unknown;
        try {
          raw = JSON.parse(String(fr.result));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'invalid JSON';
          console.warn('cookie import: invalid JSON', err);
          window.alert(`Cookie import failed: ${msg}`);
          return;
        }
        const result = v.safeParse(CookieImportSchema, raw);
        if (!result.success) {
          console.warn('cookie import: schema validation failed', result.issues);
          const summary = result.issues
            .slice(0, 3)
            .map((issue) => {
              const path = issue.path?.map((p) => p.key).join('.') ?? '';
              return path ? `${path}: ${issue.message}` : issue.message;
            })
            .join('\n');
          const more = result.issues.length > 3 ? `\n…and ${result.issues.length - 3} more` : '';
          window.alert(`Cookie import failed:\n${summary}${more}`);
          return;
        }
        const confirmed = window.confirm(
          `This will delete ${cookies.length} existing cookie(s) and import ${result.output.length}. Continue?`,
        );
        if (!confirmed) return;
        importAll(
          result.output.map(({ id: _id, ...rest }) => {
            void _id;
            return rest;
          }),
        );
      });
      fr.readAsText(file);
    });
    input.click();
  };

  return (
    <>
      {settings.showFilterBar && (
        <FilterBar value={filter} filterBy={settings.filterBy} onChange={setFilter} />
      )}
      <Header widths={widths} sort={sort} onSort={onSort} />
      <Content
        cookies={visible}
        widths={widths}
        showCopyIcons={settings.showCopyIcons}
        selectedIds={selectedIds}
        onRowClick={onRowClick}
        onFillerClick={clearSelection}
        onRowContextMenu={(e, c) => openMenuFor(e, c)}
        onFillerContextMenu={(e) => openMenuFor(e, null)}
        onRowDoubleClick={(c) => openEditorFor(c)}
      />
      <Footer
        count={visible.length}
        selectedCount={selectedIds.size}
        settings={settings}
        setSetting={setSetting}
      />
      <Resizers widths={widths} onResize={resize} />
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          isInRow={!!menu.cookie}
          selectedCount={selectedIds.size}
          onDismiss={() => setMenu(null)}
          actions={{
            onAddNew,
            onEdit: () => menu.cookie && openEditorFor(menu.cookie),
            onRemove: () => {
              if (selectedIds.size > 1) {
                removeMany(visible.filter((c) => selectedIds.has(c.id)));
                clearSelection();
              } else if (menu.cookie) {
                remove(menu.cookie);
                clearSelection();
              }
            },
            onRemoveAll: removeAll,
            onExport,
            onExportSelected,
            onImport,
            onRefresh: refresh,
          }}
        />
      )}
      {editor && (
        <CookieForm
          key={editor.isNew ? 'new' : editor.initial.id}
          initial={editor.initial}
          onSubmit={onSubmitForm}
          onCancel={() => setEditor(null)}
        />
      )}
    </>
  );
}
