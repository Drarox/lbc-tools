(() => {
  'use strict';

  const tools = window.LBCTools;
  const style = `
    .lbc-tools-price { display:inline-flex; align-items:center; flex-wrap:wrap; gap:7px; margin-left:2px; color:#1f2937; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; vertical-align:middle; }
    .lbc-tools-price__before { color:#c23522; font-size:calc(1rem * var(--spacing-factor)); line-height:1.4; text-decoration:line-through; }
    .lbc-tools-price__delta { border-radius:999px; padding:3px 8px; background:#e8f8ee; color:#087443; font-size:calc(1.25rem); line-height:1.4; font-weight:750; }
    .lbc-tools-price__delta--up { background:#fff0ee; color:#c23522; }
    .lbc-tools-date-tags { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:8px 0; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .lbc-tools-date-tag { display:inline-flex; align-items:center; min-height:20px; border-radius:999px; padding:2px 8px; background:#eef0f3; color:#5d6673; font-size:12px; font-weight:700; line-height:1.35; }
    .lbc-tools-date-tag--warning { background:#fff6dc; color:#795700; }
    .lbc-tools-date-tag--danger { background:#fff0ee; color:#c23522; }
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

  function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', ' à');
  }

  function dayDifference(value) {
    const date = new Date(value);
    const calendarToday = new Date();
    calendarToday.setHours(0, 0, 0, 0);
    const calendarDate = new Date(date);
    calendarDate.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((calendarToday - calendarDate) / 86_400_000));
  }

  function daysSince(value) {
    const days = dayDifference(value);
    if (days === 0) return "Aujourd’hui";
    if (days === 1) return 'Hier';
    return `${days} jours`;
  }

  function isSameCalendarDate(firstValue, secondValue) {
    const first = new Date(firstValue);
    const second = new Date(secondValue);
    return first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate();
  }

  function createDateTag(label, value, className = '') {
    const tag = document.createElement('span');
    tag.className = `lbc-tools-date-tag ${className}`.trim();
    tag.textContent = `${label} ${formatDate(value)} (${daysSince(value)})`;
    return tag;
  }

  function displayDates(ad) {
    const publishedAt = ad?.first_publication_date;
    const modifiedAt = ad?.index_date;
    if (!publishedAt && !modifiedAt) return;

    const description = document.querySelector('[data-qa-id="adview_spotlight_description_container"]');
    if (!description) return;
    description.querySelector('.lbc-tools-date-tags')?.remove();

    const tags = document.createElement('div');
    tags.className = 'lbc-tools-date-tags';
    if (publishedAt) {
      const age = dayDifference(publishedAt);
      const statusClass = age > 60
        ? 'lbc-tools-date-tag--danger'
        : age > 14 ? 'lbc-tools-date-tag--warning' : '';
      tags.append(createDateTag('Publié le', publishedAt, statusClass));
    }
    if (modifiedAt) {
      const statusClass = publishedAt && !isSameCalendarDate(publishedAt, modifiedAt)
        ? 'lbc-tools-date-tag--danger' : '';
      tags.append(createDateTag('Modifié le', modifiedAt, statusClass));
    }

    const existingTag = description.querySelector('[data-spark-component="tag"]');
    if (existingTag?.parentElement) existingTag.parentElement.prepend(tags);
    else description.append(tags);
  }

  tools.enhancePriceDisplays = async () => {
    const detail = document.querySelector('article#grid');
    if (detail) {
      const id = tools.adIdFromUrl(location.pathname);
      if (id) {
        const ad = await tools.getPublicAd(id);
        displayPriceChange(detail, id, ad);
        displayDates(ad);
      }
    }

    for (const card of document.querySelectorAll('[data-qa-id="aditem_container"]')) {
      const id = tools.adIdFromUrl(card.querySelector('a[href*="/ad/"]')?.getAttribute('href'));
      if (id) displayPriceChange(card, id, await tools.getPublicAd(id));
    }
  };

  addStyle();
})();
