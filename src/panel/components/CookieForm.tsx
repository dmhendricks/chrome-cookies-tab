import { useEffect, useRef, useState } from 'preact/hooks';
import type { UICookie } from '../types';
import { expirationDate, formatExpiration, isSession } from '../util';
import { t } from '../i18n';
import type { ToastSeverity } from '../hooks/useToasts';

// Chrome enforces RFC 6265bis: cookies whose Max-Age/Expires exceeds 400 days
// are silently capped. We warn the user and let them proceed.
const MAX_COOKIE_LIFETIME_SECONDS = 400 * 24 * 60 * 60;

export interface FormValues {
  name: string;
  value: string;
  domain: string;
  path: string;
  expirationDate?: number;
  session: boolean;
  hostOnly: boolean;
  httpOnly: boolean;
  secure: boolean;
}

interface Props {
  initial: UICookie;
  isNew: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  showToast: (message: string, severity?: ToastSeverity, durationMs?: number) => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDatetimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CookieForm({ initial, isNew, onSubmit, onCancel, showToast }: Props) {
  const initialDate = expirationDate(initial);
  const valueRef = useRef<HTMLTextAreaElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [tallValue, setTallValue] = useState(false);
  const [name, setName] = useState(initial.name ?? '');
  const [value, setValue] = useState(initial.value ?? '');
  const [domain, setDomain] = useState(initial.domain ?? '');
  const [path, setPath] = useState(initial.path ?? '/');
  const [session, setSession] = useState(isSession(initial));
  const [hostOnly, setHostOnly] = useState(!!initial.hostOnly);
  const [httpOnly, setHttpOnly] = useState(!!initial.httpOnly);
  const [secure, setSecure] = useState(!!initial.secure);
  const [expires, setExpires] = useState(
    toDatetimeLocal(initialDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
  );

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      setShowHeader(h >= 250);
      setTallValue(h > 300);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const submit = (e: Event) => {
    e.preventDefault();
    const values: FormValues = {
      name,
      value,
      domain,
      path,
      session,
      hostOnly,
      httpOnly,
      secure,
    };
    if (!session) {
      const dt = new Date(expires);
      if (!Number.isNaN(dt.getTime())) {
        const requested = Math.floor(dt.getTime() / 1000);
        const cap = Math.floor(Date.now() / 1000) + MAX_COOKIE_LIFETIME_SECONDS;
        if (requested > cap) {
          showToast(t('formExpirationCapped', formatExpiration(new Date(cap * 1000))), 'warn', 6000);
          values.expirationDate = cap;
        } else {
          values.expirationDate = requested;
        }
      }
    }
    onSubmit(values);
  };

  return (
    <div id="cookie-form-view" ref={viewRef}>
      {showHeader && (
        <div id="cookie-form-view-header">
          <span>{isNew ? t('formAddTitle') : t('formEditTitle')}</span>
          <button
            type="button"
            className="cookie-form-close"
            aria-label={t('formClose')}
            title={t('formClose')}
            onClick={onCancel}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      <form id="cookie-form" onSubmit={submit}>
        <div id="cookie-form-body">
          <div className="form-field">
            <label for="cf-name">{t('formName')}</label>
            <input
              id="cf-name"
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="form-field align-top">
            <label for="cf-value">{t('formValue')}</label>
            <textarea
              id="cf-value"
              ref={valueRef}
              value={value}
              style={tallValue ? { minHeight: '88px' } : undefined}
              onInput={(e) => setValue((e.target as HTMLTextAreaElement).value)}
            />
          </div>
          <div className="form-field">
            <label for="cf-domain">{t('formDomain')}</label>
            <input
              id="cf-domain"
              type="text"
              value={domain}
              onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="form-field">
            <label for="cf-path">{t('formPath')}</label>
            <input
              id="cf-path"
              type="text"
              value={path}
              onInput={(e) => setPath((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="form-field">
            <label for="cf-expires">{t('formExpires')}</label>
            <input
              id="cf-expires"
              type="datetime-local"
              value={expires}
              disabled={session}
              required={!session}
              onInput={(e) => setExpires((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="form-flags">
            <label className="flag">
              <input
                type="checkbox"
                checked={session}
                onChange={(e) => setSession((e.target as HTMLInputElement).checked)}
              />
              {t('formFlagSession')}
            </label>
            <label className="flag">
              <input
                type="checkbox"
                checked={hostOnly}
                onChange={(e) => setHostOnly((e.target as HTMLInputElement).checked)}
              />
              {t('formFlagHostOnly')}
            </label>
            <label className="flag">
              <input
                type="checkbox"
                checked={httpOnly}
                onChange={(e) => setHttpOnly((e.target as HTMLInputElement).checked)}
              />
              {t('formFlagHttpOnly')}
            </label>
            <label className="flag">
              <input
                type="checkbox"
                checked={secure}
                onChange={(e) => setSecure((e.target as HTMLInputElement).checked)}
              />
              {t('formFlagSecure')}
            </label>
          </div>
          <div className="form-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onCancel();
              }}
            >
              {t('formCancel')}
            </button>
            <button className="btn-primary" type="submit">
              {t('formSave')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
