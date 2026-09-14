(() => {
  'use strict';

  const tools = window.LBCTools;
  const depositPage = 'https://www.leboncoin.fr/deposer-une-annonce';
  const optionsPage = `${depositPage}/options`;

  const style = `
    .lbc-tools-relist { display:inline-flex; align-items:center; justify-content:center; min-height:44px; border:0; border-radius:9px; padding:0 14px; background:#EC5A13; color:#fff; box-shadow:0 2px 5px rgba(236,90,19,.25); font:700 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; cursor:pointer; }
    .lbc-tools-relist:hover { background:#ca4810; } .lbc-tools-relist:disabled { opacity:.65; cursor:wait; }
    .lbc-tools-dialog-backdrop { position:fixed; inset:0; z-index:2147483646; display:grid; place-items:center; padding:18px; background:rgba(15,23,42,.48); font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .lbc-tools-dialog { width:min(440px,100%); padding:24px; border-radius:16px; background:#fff; color:#172033; box-shadow:0 20px 60px rgba(0,0,0,.3); }
    .lbc-tools-dialog h2 { margin:0 0 7px; font-size:20px; } .lbc-tools-dialog p { margin:0 0 18px; color:#526070; font-size:14px; line-height:1.45; }
    .lbc-tools-dialog label { display:block; margin-bottom:7px; font-size:13px; font-weight:700; } .lbc-tools-dialog input { box-sizing:border-box; width:100%; padding:11px; border:1px solid #b8c2d0; border-radius:8px; font:inherit; }
    .lbc-tools-dialog__actions { display:flex; flex-wrap:wrap; gap:9px; margin-top:20px; } .lbc-tools-dialog button { border:0; border-radius:8px; padding:10px 12px; font:700 13px/1 system-ui; cursor:pointer; }
    .lbc-tools-dialog__primary { background:#EC5A13; color:#fff; } .lbc-tools-dialog__draft { background:#fff0e9; color:#b9420c; } .lbc-tools-dialog__cancel { margin-left:auto; color:#526070; background:#f2f4f7; }
  `;

  function addStyle() {
    if (document.getElementById('lbc-tools-relist-style')) return;
    const node = document.createElement('style');
    node.id = 'lbc-tools-relist-style';
    node.textContent = style;
    document.documentElement.append(node);
  }

  function requestHeaders(referer, extra = {}) {
    const visitorId = document.cookie.match(/(?:^|;\s*)cnfdVisitorId=([^;]+)/)?.[1] || '';
    return {
      accept: '*/*',
      'content-type': 'application/json',
      authorization: `Bearer ${tools.getToken()}`,
      origin: 'https://www.leboncoin.fr',
      referer,
      'x-lbc-experiment': btoa(JSON.stringify({ version: 1, rollout_visitor_id: visitorId })),
      ...extra
    };
  }

  async function apiRequest(url, options) {
    const response = await fetch(url, { credentials: 'include', ...options });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const suffix = detail ? ` : ${detail.slice(0, 180)}` : '';
      throw new Error(`Leboncoin a refusé l’opération (${response.status})${suffix}`);
    }
    // Some Leboncoin mutation endpoints successfully return an empty 200 body
    // (notably deletion). Parsing those as JSON turns a successful operation
    // into a misleading "malformed JSON" error.
    if (response.status === 204 || response.headers.get('content-length') === '0') return null;
    const responseType = response.headers.get('content-type') || '';
    if (!responseType.includes('application/json')) return null;
    const body = await response.text();
    return body.trim() ? JSON.parse(body) : null;
  }

  async function fetchOwnAd(id) {
    // This intentionally mirrors the reference relister's authenticated GET.
    // The private pintad representation contains fields required to recreate an ad.
    const authToken = tools.getToken();
    return apiRequest(`${tools.apiBase}/api/pintad/v1/public/manual/classified/${id}`, {
      method: 'GET',
      headers: {
        accept: '*/*',
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json'
      }
    });
  }

  function cleanPayload(ad) {
    const payload = { ...ad, tracking_dd: 'app:308.2', price_cents: String(Math.round(Number(ad.price) * 100)) };
    ['list_id', 'ad_id', 'first_publication_date', 'index_date', 'status', 'url', 'price'].forEach(key => delete payload[key]);
    return payload;
  }

  async function deleteOriginal(id) {
    await apiRequest(`${tools.apiBase}/api/pintad/v1/public/manual/delete/ads`, {
      method: 'DELETE',
      headers: requestHeaders('https://www.leboncoin.fr/compte/mes-annonces/suppression', { api_key: 'ba0c2dad52b3ec' }),
      body: JSON.stringify({ list_ids: [Number(id)] })
    });
  }

  async function createDraft(ad) {
    const payload = cleanPayload(ad);
    const attributeMap = Array.isArray(payload.attributes)
      ? Object.fromEntries(payload.attributes.map(({ key, value }) => [key, value]))
      : payload.attributes || {};
    payload.attributes = { ...attributeMap, ad_submission_id: crypto.randomUUID(), ad_submission_source: 'insertion-dynamic-v1' };

    const result = await apiRequest(`${tools.apiBase}/api/ad-draft/v1/draft`, {
      method: 'POST', headers: requestHeaders(depositPage), body: JSON.stringify(payload)
    });
    if (!result?.draft_id) throw new Error('Le brouillon n’a pas été créé.');
    return result.draft_id;
  }

  async function publishCopy(ad) {
    const payload = cleanPayload(ad);
    const created = await apiRequest(`${tools.apiBase}/api/adsubmit/v2/classifieds?with_variation=true`, {
      method: 'POST', headers: requestHeaders(depositPage), body: JSON.stringify(payload)
    });
    if (!created?.ad_id) throw new Error('La nouvelle annonce n’a pas été créée.');

    const actionId = created.action_id || 1;
    const pricing = await apiRequest(`${tools.apiBase}/api/options/v4/pricing/classifieds`, {
      method: 'POST', headers: requestHeaders(optionsPage),
      body: JSON.stringify({ user_journey: 'deposit', page_name: 'option', classifieds: [{ ad_id: created.ad_id, category: String(payload.category_id), action_id: actionId }], is_edit_refused: false })
    });
    if (!pricing?.pricing_id) throw new Error('Les options de publication sont indisponibles.');

    await apiRequest(`${tools.apiBase}/api/services/v4/submit`, {
      method: 'POST', headers: requestHeaders(optionsPage),
      body: JSON.stringify({ ads: [{ ad_type: payload.ad_type, ad_id: created.ad_id, options: [], action_id: actionId, transaction_type: 'new_ad' }], pricing_id: pricing.pricing_id, user_journey: 'deposit' })
    });
  }

  async function relist(id, mode, price, closeDialog) {
    if (tools.state.relisting) return;
    tools.state.relisting = true;
    try {
      const ad = await fetchOwnAd(id);
      ad.price = price;
      if (mode === 'draft') {
        const draftId = await createDraft(ad);
        await deleteOriginal(id);
        location.assign(`https://www.leboncoin.fr/brouillon/${draftId}/finaliser`);
        return;
      }
      await publishCopy(ad);
      await deleteOriginal(id);
      closeDialog();
      tools.showToast('Annonce republiée. La liste va se mettre à jour.');
      setTimeout(() => location.reload(), 1300);
    } catch (error) {
      tools.showToast(error.message || 'Une erreur est survenue.');
    } finally {
      tools.state.relisting = false;
    }
  }

  async function openRelistDialog(id) {
    let ad;
    try { ad = await fetchOwnAd(id); } catch (error) { tools.showToast(error.message); return; }

    const backdrop = document.createElement('div');
    backdrop.className = 'lbc-tools-dialog-backdrop';
    const dialog = document.createElement('section');
    dialog.className = 'lbc-tools-dialog';
    const input = document.createElement('input');
    input.type = 'number'; input.min = '1'; input.step = '0.01'; input.value = String(ad.price);
    const close = () => backdrop.remove();
    const run = mode => {
      const price = Number(input.value);
      if (!price || price <= 0) return tools.showToast('Saisissez un prix valide.');
      relist(id, mode, price, close);
    };

    const makeButton = (label, className, handler) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = className; button.textContent = label; button.onclick = handler;
      return button;
    };
    const title = document.createElement('h2'); title.textContent = 'Relister cette annonce';
    const note = document.createElement('p'); note.textContent = 'Une copie est créée, puis l’annonce actuelle est supprimée seulement si la création a réussi.';
    const label = document.createElement('label'); label.textContent = 'Prix de la nouvelle annonce';
    const actions = document.createElement('div'); actions.className = 'lbc-tools-dialog__actions';
    actions.append(
      makeButton('Publier maintenant', 'lbc-tools-dialog__primary', () => run('publish')),
      makeButton('Modifier avant de publier', 'lbc-tools-dialog__draft', () => run('draft')),
      makeButton('Annuler', 'lbc-tools-dialog__cancel', close)
    );
    dialog.append(title, note, label, input, actions);
    backdrop.append(dialog);
    backdrop.onclick = event => { if (event.target === backdrop) close(); };
    document.body.append(backdrop);
    input.focus();
  }

  tools.addRelistButtons = () => {
    if (!location.pathname.startsWith('/compte/part/mes-annonces')) return;
    for (const card of document.querySelectorAll('li[data-qa-id="ad_item_container"]')) {
      if (card.querySelector('[data-lbc-tools-relist]') || /mise en pause/i.test(card.textContent)) continue;
      const id = tools.adIdFromUrl(card.querySelector('a[href*="/ad/"]')?.getAttribute('href'));
      const target = card.querySelector('.mt-md.gap-md.flex.flex-wrap') || card.querySelector('button')?.parentElement;
      if (!id || !target) continue;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'lbc-tools-relist'; button.dataset.lbcToolsRelist = id;
      button.textContent = 'Relister'; button.onclick = () => openRelistDialog(id);
      target.append(button);
    }
  };

  addStyle();
})();
