(() => {
  'use strict';

  const tools = window.LBCTools = window.LBCTools || {};
  tools.apiBase = 'https://api.leboncoin.fr';
  tools.state = { relisting: false };

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
})();
