import { useState } from 'preact/hooks';
import type { UICookie } from '../types';
import { expirationDate, isSession } from '../util';

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
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function CookieForm({ initial, onSubmit, onCancel }: Props) {
  const initialDate = expirationDate(initial);
  const [name, setName] = useState(initial.name ?? '');
  const [value, setValue] = useState(initial.value ?? '');
  const [domain, setDomain] = useState(initial.domain ?? '');
  const [path, setPath] = useState(initial.path ?? '/');
  const [session, setSession] = useState(isSession(initial));
  const [hostOnly, setHostOnly] = useState(!!initial.hostOnly);
  const [httpOnly, setHttpOnly] = useState(!!initial.httpOnly);
  const [secure, setSecure] = useState(!!initial.secure);

  const [month, setMonth] = useState(initialDate ? initialDate.getMonth() + 1 : 1);
  const [day, setDay] = useState(initialDate ? initialDate.getDate() : 1);
  const [year, setYear] = useState(
    initialDate ? initialDate.getFullYear() : new Date().getFullYear() + 1,
  );
  const [hours, setHours] = useState(initialDate ? initialDate.getHours() : 0);
  const [minutes, setMinutes] = useState(initialDate ? initialDate.getMinutes() : 0);
  const [seconds, setSeconds] = useState(initialDate ? initialDate.getSeconds() : 0);

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
      const dt = new Date(year, month - 1, day, hours, minutes, seconds);
      values.expirationDate = Math.floor(dt.getTime() / 1000);
    }
    onSubmit(values);
  };

  return (
    <div id="cookie-form-view">
      <form id="cookie-form" onSubmit={submit}>
        <div id="cookie-form-body">
          <table>
            <tbody>
              <tr>
                <th className="label"><label>Name</label></th>
                <td className="data">
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onInput={(e) => setName((e.target as HTMLInputElement).value)}
                  />
                </td>
              </tr>
              <tr>
                <th className="label"><label>Value</label></th>
                <td className="data">
                  <textarea
                    value={value}
                    onInput={(e) => setValue((e.target as HTMLTextAreaElement).value)}
                  />
                </td>
              </tr>
              <tr>
                <th className="label"><label>Domain</label></th>
                <td className="data">
                  <input
                    type="text"
                    name="domain"
                    value={domain}
                    onInput={(e) => setDomain((e.target as HTMLInputElement).value)}
                  />
                </td>
              </tr>
              <tr>
                <th className="label"><label>Path</label></th>
                <td className="data">
                  <input
                    type="text"
                    name="path"
                    value={path}
                    onInput={(e) => setPath((e.target as HTMLInputElement).value)}
                  />
                </td>
              </tr>
              <tr>
                <th className="label"><label>Expires</label></th>
                <td className="data">
                  <input
                    className="expires-input month"
                    type="number"
                    placeholder="MM"
                    min={1}
                    max={12}
                    value={pad(month)}
                    disabled={session}
                    required
                    onInput={(e) => setMonth(Number((e.target as HTMLInputElement).value))}
                  />
                  /
                  <input
                    className="expires-input day"
                    type="number"
                    placeholder="DD"
                    min={1}
                    max={31}
                    value={pad(day)}
                    disabled={session}
                    required
                    onInput={(e) => setDay(Number((e.target as HTMLInputElement).value))}
                  />
                  /
                  <input
                    className="expires-input year"
                    type="number"
                    placeholder="YYYY"
                    value={year}
                    disabled={session}
                    required
                    onInput={(e) => setYear(Number((e.target as HTMLInputElement).value))}
                  />
                  -
                  <input
                    className="expires-input hours"
                    type="number"
                    placeholder="HH"
                    min={0}
                    max={23}
                    value={pad(hours)}
                    disabled={session}
                    required
                    onInput={(e) => setHours(Number((e.target as HTMLInputElement).value))}
                  />
                  :
                  <input
                    className="expires-input minutes"
                    type="number"
                    placeholder="MM"
                    min={0}
                    max={59}
                    value={pad(minutes)}
                    disabled={session}
                    required
                    onInput={(e) => setMinutes(Number((e.target as HTMLInputElement).value))}
                  />
                  :
                  <input
                    className="expires-input seconds"
                    type="number"
                    placeholder="SS"
                    min={0}
                    max={59}
                    value={pad(seconds)}
                    disabled={session}
                    required
                    onInput={(e) => setSeconds(Number((e.target as HTMLInputElement).value))}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="data checkboxes">
                  <span>
                    <input
                      id="session-checkbox"
                      type="checkbox"
                      checked={session}
                      onChange={(e) => setSession((e.target as HTMLInputElement).checked)}
                    />
                    <label for="session-checkbox">Session</label>
                  </span>
                  <span>
                    <input
                      id="hostOnly-checkbox"
                      type="checkbox"
                      checked={hostOnly}
                      onChange={(e) => setHostOnly((e.target as HTMLInputElement).checked)}
                    />
                    <label for="hostOnly-checkbox">Host Only</label>
                  </span>
                  <span>
                    <input
                      id="httpOnly-checkbox"
                      type="checkbox"
                      checked={httpOnly}
                      onChange={(e) => setHttpOnly((e.target as HTMLInputElement).checked)}
                    />
                    <label for="httpOnly-checkbox">HTTP Only</label>
                  </span>
                  <span>
                    <input
                      id="secure-checkbox"
                      type="checkbox"
                      checked={secure}
                      onChange={(e) => setSecure((e.target as HTMLInputElement).checked)}
                    />
                    <label for="secure-checkbox">Secure</label>
                  </span>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="data buttons">
                  <button id="submit" type="submit">Save</button>
                  <button
                    id="cancel"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onCancel();
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
