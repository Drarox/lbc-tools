(() => {
  'use strict';

  const tools = window.LBCTools;
  let refreshTimer;

  function refresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      tools.enhancePriceDisplays();
      tools.addRelistButtons();
    }, 350);
  }

  tools.refresh = refresh;
  refresh();
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', refresh);
})();
