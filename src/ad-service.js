(() => {
  'use strict';

  const tools = window.LBCTools;
  const cache = new Map();
  const waiters = new Map();

  function saveAd(ad) {
    if (ad?.list_id === undefined) return;
    const id = String(ad.list_id);
    cache.set(id, ad);
    waiters.get(id)?.forEach(resolve => resolve(ad));
    waiters.delete(id);
  }

  function findAds(value, depth = 0) {
    if (depth > 15 || !value || typeof value !== 'object') return;
    if (value.list_id !== undefined) {
      saveAd(value);
      return;
    }
    const children = Array.isArray(value) ? value : Object.values(value);
    children.forEach(child => findAds(child, depth + 1));
  }

  function readNextData(id) {
    try {
      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData?.textContent) findAds(JSON.parse(nextData.textContent));
      if (window.__NEXT_DATA__) findAds(window.__NEXT_DATA__);
      return cache.get(String(id)) || null;
    } catch {
      return null;
    }
  }

  function installPageFetchObserver() {
    if (window.__lbcToolsFetchObserved) return;
    window.__lbcToolsFetchObserved = true;
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      if (url.includes('/finder/classified') || url.includes('adfinder') || url.includes('/_next/data')) {
        response.clone().json().then(data => findAds(data)).catch(() => {});
      }
      return response;
    };
  }

  function waitForPageData(id) {
    return new Promise(resolve => {
      const idAsString = String(id);
      const callbacks = waiters.get(idAsString) || [];
      callbacks.push(resolve);
      waiters.set(idAsString, callbacks);
      setTimeout(() => {
        const pending = waiters.get(idAsString) || [];
        const index = pending.indexOf(resolve);
        if (index >= 0) pending.splice(index, 1);
        if (pending.length === 0) waiters.delete(idAsString);
        resolve(null);
      }, 3000);
    });
  }

  async function fetchPublicAd(id) {
    const endpoints = [
      `${tools.apiBase}/api/adfinder/v1/classified/${id}`,
      `${tools.apiBase}/finder/classified/${id}`
    ];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: { Accept: 'application/json' }
        });
        if (response.ok) return response.json();
      } catch {
        // The next fallback is intentionally attempted.
      }
    }
    return null;
  }

  tools.getPublicAd = async (id) => {
    const key = String(id);
    if (cache.has(key)) return cache.get(key);

    const fromPage = readNextData(key);
    if (fromPage) return fromPage;

    const captured = await waitForPageData(key);
    if (captured) return captured;

    const fetched = await fetchPublicAd(key);
    if (fetched) saveAd(fetched);
    return fetched;
  };

  installPageFetchObserver();
})();
