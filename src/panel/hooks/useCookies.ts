import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import * as v from 'valibot';
import type { Socket } from '../socket';
import type { UICookie } from '../types';
import {
  IncomingCookieSchema,
  IncomingCookieListSchema,
} from '../../shared/cookie-schema';

const UpdateResponseSchema = v.intersect([
  IncomingCookieSchema,
  v.object({ id: v.number() }),
]);

export function useCookies(socket: Socket) {
  const [cookies, setCookies] = useState<UICookie[]>([]);
  const ctr = useRef(0);

  const nextId = () => {
    ctr.current += 1;
    return ctr.current;
  };

  useEffect(() => {
    const offRead = socket.on('cookies:read', (data) => {
      const result = v.safeParse(IncomingCookieListSchema, data);
      if (!result.success) return;
      setCookies(result.output.cookies.map((c) => ({ ...c, id: nextId() })));
    });

    const offCreate = socket.on('cookies:create', (data) => {
      const result = v.safeParse(IncomingCookieSchema, data);
      if (!result.success) return;
      setCookies((prev) => [...prev, { ...result.output, id: nextId() }]);
    });

    const offUpdate = socket.on('cookies:update', (data) => {
      const result = v.safeParse(UpdateResponseSchema, data);
      if (!result.success) return;
      const updated = result.output;
      setCookies((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      );
    });

    const offRemoveAll = socket.on('removeAllCookies', () => {
      setCookies([]);
    });

    const offNavigate = socket.on('navigate', () => {
      setCookies([]);
    });

    socket.saveListener();
    socket.read();

    return () => {
      offRead();
      offCreate();
      offUpdate();
      offRemoveAll();
      offNavigate();
    };
  }, [socket]);

  const api = useMemo(
    () => ({
      refresh: () => socket.read(),
      create: (cookie: Parameters<Socket['create']>[0]) => socket.create(cookie),
      remove: (cookie: UICookie) => {
        setCookies((prev) => prev.filter((c) => c.id !== cookie.id));
        socket.remove(cookie);
      },
      removeAll: () => {
        setCookies([]);
        socket.removeAll();
      },
      importAll: (cookies: Parameters<Socket['import']>[0]) => {
        setCookies([]);
        socket.import(cookies);
      },
      update: (
        previous: UICookie,
        changed: Partial<UICookie> & { session?: boolean; hostOnly?: boolean },
      ) => {
        setCookies((prev) =>
          prev.map((c) =>
            c.id === previous.id ? ({ ...c, ...changed } as UICookie) : c,
          ),
        );
        socket.update(previous, changed);
      },
    }),
    [socket],
  );

  return { cookies, ...api };
}
