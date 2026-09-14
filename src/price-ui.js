(() => {
  'use strict';

  const tools = window.LBCTools;
  const style = `
    .lbc-tools-price { display:inline-flex; align-items:center; flex-wrap:wrap; gap:7px; margin-left:2px; color:#1f2937; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; vertical-align:middle; }
    .lbc-tools-price__before { color:#c23522; font-size:calc(1rem * var(--spacing-factor)); line-height:1.4; text-decoration:line-through; }
    .lbc-tools-price__delta { border-radius:999px; padding:3px 8px; background:#e8f8ee; color:#087443; font-size:calc(1.25rem); line-height:1.4; font-weight:750; }
    .lbc-tools-price__delta--up { background:#fff0ee; color:#c23522; }
    .lbc-tools-toast { position:fixed; right:20px; bottom:20px; z-index:2147483647; max-width:360px; padding:13px 16px; border-radius:10px; background:#EC5A13; color:#fff; box-shadow:0 8px 25px rgba(0,0,0,.25); font:600 14px/1.35 system-ui; }
  `;

  function addStyle() {
    if (document.getElementById('lbc-tools-price-style')) return;
    const node = document.createElement('style');
    node.id = 'lbc-tools-price-style';
    node.textContent = style;
    document.documentElement.append(node);
  }

  function findPriceNode(scope) {
    return scope.querySelector('[data-qa-id="adview_price"], [data-test-id="price"]') ||
      [...scope.querySelectorAll('p, span')].find(node => /^\s*\d[\d\s ]*\s*€/.test(node.textContent));
  }

  function displayPriceChange(scope, id, ad) {
    const previous = Number(tools.getOldPrice(ad));
    const current = Number(Array.isArray(ad?.price) ? ad.price[0] : ad?.price);
    if (!previous || !current || scope.querySelector(`[data-lbc-tools-price="${id}"]`)) return;

    const anchor = findPriceNode(scope);
    if (!anchor) return;

    const difference = current - previous;
    const percent = Math.abs((difference / previous) * 100);
    const panel = document.createElement('div');
    panel.className = 'lbc-tools-price';
    panel.dataset.lbcToolsPrice = id;

    const oldLabel = document.createElement('span');
    oldLabel.className = 'lbc-tools-price__before';
    oldLabel.textContent = tools.formatEuros(previous);

    const changeLabel = document.createElement('span');
    changeLabel.className = `lbc-tools-price__delta${difference > 0 ? ' lbc-tools-price__delta--up' : ''}`;
    changeLabel.textContent = `${difference > 0 ? '↗' : '↘'} ${tools.formatEuros(Math.abs(difference))} (${percent.toFixed(1).replace('.', ',')} %)`;

    panel.append(oldLabel, changeLabel);
    anchor.after(panel);
  }

  tools.enhancePriceDisplays = async () => {
    const detail = document.querySelector('article#grid');
    if (detail) {
      const id = tools.adIdFromUrl(location.pathname);
      if (id) displayPriceChange(detail, id, await tools.getPublicAd(id));
    }

    for (const card of document.querySelectorAll('[data-qa-id="aditem_container"]')) {
      const id = tools.adIdFromUrl(card.querySelector('a[href*="/ad/"]')?.getAttribute('href'));
      if (id) displayPriceChange(card, id, await tools.getPublicAd(id));
    }
  };

  addStyle();
})();
