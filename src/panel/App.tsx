import { useMemo, useState } from 'preact/hooks';
import * as v from 'valibot';
import { Header } from './components/Header';
import { Content } from './components/Content';
import { Footer } from './components/Footer';
import { ContextMenu } from './components/ContextMenu';
import { CookieForm, type FormValues } from './components/CookieForm';
import { Resizers } from './components/Resizers';
import { useCookies } from './hooks/useCookies';
import { useColumnResize } from './hooks/useColumnResize';
import { sortCookies } from './util';
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
  const { cookies, refresh, create, remove, removeAll, update } = useCookies(socket);
  const { widths, resize } = useColumnResize();
  const [sort, setSort] = useState<SortState | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const sorted = useMemo(
    () => (sort ? sortCookies(cookies, sort.column, sort.dir) : cookies),
    [cookies, sort],
  );

  const onSort = (col: SortColumn) => {
    setSort((prev) => {
      if (!prev || prev.column !== col) return { column: col, dir: 'asc' };
      return { column: col, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  const openMenuFor = (e: MouseEvent, cookie: UICookie | null) => {
    e.stopPropagation();
    e.preventDefault();
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
        id: -1,
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

  const onExport = () => {
    const a = document.createElement('a');
    const blob = new Blob([JSON.stringify(cookies, null, '  ')]);
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'export.json';
    a.click();
  };

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
        } catch {
          console.warn('cookie import: invalid JSON');
          return;
        }
        const result = v.safeParse(CookieImportSchema, raw);
        if (!result.success) {
          console.warn('cookie import: schema validation failed', result.issues);
          return;
        }
        removeAll();
        for (const c of result.output) {
          const { id: _id, ...rest } = c;
          void _id;
          create(rest);
        }
      });
      fr.readAsText(file);
    });
    input.click();
  };

  return (
    <>
      <Header widths={widths} sort={sort} onSort={onSort} />
      <Content
        cookies={sorted}
        widths={widths}
        onRowContextMenu={(e, c) => openMenuFor(e, c)}
        onFillerContextMenu={(e) => openMenuFor(e, null)}
        onRowDoubleClick={(c) => openEditorFor(c)}
      />
      <Footer count={cookies.length} />
      <Resizers widths={widths} onResize={resize} />
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          isInRow={!!menu.cookie}
          onDismiss={() => setMenu(null)}
          actions={{
            onAddNew,
            onEdit: () => menu.cookie && openEditorFor(menu.cookie),
            onRemove: () => menu.cookie && remove(menu.cookie),
            onRemoveAll: removeAll,
            onExport,
            onImport,
            onRefresh: refresh,
          }}
        />
      )}
      {editor && (
        <CookieForm
          initial={editor.initial}
          onSubmit={onSubmitForm}
          onCancel={() => setEditor(null)}
        />
      )}
    </>
  );
}
