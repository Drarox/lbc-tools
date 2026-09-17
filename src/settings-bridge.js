(() => {
  'use strict';

  const api = typeof browser !== 'undefined' ? browser : chrome;
  const defaults = { relister: true, oldPrice: true, dates: true };

  async function sendSettings() {
    const settings = await api.storage.local.get(defaults);
    window.postMessage({ type: 'LBC_TOOLS_SETTINGS', settings }, '*');
  }

  window.addEventListener('message', event => {
    if (event.source === window && event.data?.type === 'LBC_TOOLS_GET_SETTINGS') sendSettings();
  });
  api.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && Object.keys(changes).some(key => key in defaults)) sendSettings();
  });
  sendSettings();
})();
