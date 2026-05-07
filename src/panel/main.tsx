import { render } from 'preact';
import { App } from './App';
import { Socket } from './socket';
import { t } from './i18n';

document.title = t('extName');

interface PanelWindow extends Window {
  __cookieInspectorVisible__?: boolean;
}

const tabId = chrome.devtools.inspectedWindow.tabId;
const socket = new Socket(tabId);

const root = document.getElementById('app');
if (root) render(<App socket={socket} />, root);

const win = window as PanelWindow;
const sendVisibility = () => {
  socket.setVisibility(win.__cookieInspectorVisible__ !== false);
};
win.addEventListener('cookie-inspector:visibility', sendVisibility);
sendVisibility();
