(() => {
  'use strict';

  const tools = window.LBCTools = window.LBCTools || {};
  tools.apiBase = 'https://api.leboncoin.fr';
  tools.state = { relisting: false };
  tools.features = { relister: true, oldPrice: true, dates: true };

  tools.adIdFromUrl = (url) => url?.match(/\/(\d+)(?:\D*)$/)?.[1] || null;
  tools.formatEuros = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value))} €`;
  tools.getOldPrice = (ad) => ad?.attributes?.find(({ key }) => key === 'old_price')?.value;

  tools.getToken = () => {
    const match = document.cookie.match(/(?:^|;\s*)luat=([^;]+)/);
    const token = match?.[1] || localStorage.getItem('luat');
    if (!token) throw new Error('Session introuvable. Reconnectez-vous à Leboncoin puis réessayez.');
    return token;
  };

  tools.showToast = (message) => {
    document.querySelector('.lbc-tools-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'lbc-tools-toast';
    toast.textContent = message;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 5500);
  };

  tools.applySettings = (settings) => {
    tools.features = { ...tools.features, ...settings };
    if (!tools.features.oldPrice) document.querySelectorAll('.lbc-tools-price').forEach(node => node.remove());
    if (!tools.features.dates) document.querySelectorAll('.lbc-tools-date-tags').forEach(node => node.remove());
    if (!tools.features.relister) document.querySelectorAll('[data-lbc-tools-relist]').forEach(node => node.remove());
    tools.refresh?.();
  };

  window.addEventListener('message', event => {
    if (event.source === window && event.data?.type === 'LBC_TOOLS_SETTINGS') {
      tools.applySettings(event.data.settings || {});
    }
  });
  const requestSettings = () => window.postMessage({ type: 'LBC_TOOLS_GET_SETTINGS' }, '*');
  requestSettings();
  // Content scripts from separate execution worlds do not have an ordering
  // guarantee, so request once more after the isolated settings bridge loads.
  setTimeout(requestSettings, 250);
})();
