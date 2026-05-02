import { useState } from 'preact/hooks';
import type { UICookie } from '../types';
import { cookieSize, expirationDate, isSession } from '../util';

interface Props {
  cookie: UICookie;
  onContextMenu: (e: MouseEvent, c: UICookie) => void;
  onDoubleClick: (c: UICookie) => void;
}

function ClipboardIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
      <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyAffordance({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    });
  };
  return (
    <span
      className="copy-affordance"
      title="Copy"
      onClick={onClick}
      onDblClick={(e) => e.stopPropagation()}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
    </span>
  );
}

export function CookieRow({ cookie, onContextMenu, onDoubleClick }: Props) {
  const session = isSession(cookie);
  const expires = expirationDate(cookie);
  return (
    <tr
      className="cookie-row"
      onContextMenu={(e) => onContextMenu(e as unknown as MouseEvent, cookie)}
      onDblClick={() => onDoubleClick(cookie)}
    >
      <td>
        <div className="copy-cell">
          <span className="cell-text">{cookie.name}</span>
          <CopyAffordance value={cookie.name} />
        </div>
      </td>
      <td>
        <div className="copy-cell">
          <span className="cell-text">{cookie.value}</span>
          <CopyAffordance value={cookie.value} />
        </div>
      </td>
      <td><div className="domain">{cookie.domain}</div></td>
      <td><div className="size">{cookieSize(cookie)} B</div></td>
      <td><div>{cookie.path}</div></td>
      <td>
        {session ? (
          <div className="green">Session</div>
        ) : (
          <div>{expires ? expires.toString() : ''}</div>
        )}
      </td>
      <td>{cookie.httpOnly ? <div className="green">True</div> : null}</td>
      <td>{cookie.secure ? <div className="green">True</div> : null}</td>
      <td></td>
    </tr>
  );
}
