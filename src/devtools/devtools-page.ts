chrome.devtools.panels.create(
  'Cookies',
  'cookie-icon.png',
  'src/panel/panel.html',
  (panel) => {
    const themeColor = chrome.devtools.panels.themeName;

    panel.onShown.addListener((panelWindow) => {
      (panelWindow as Window).document.body.classList.add(`${themeColor}Theme`);
    });
  },
);
