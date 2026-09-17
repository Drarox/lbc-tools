(() => {
  'use strict';
  const api = typeof browser !== 'undefined' ? browser : chrome;
  const defaults = { relister: true, oldPrice: true, dates: true };
  const controls = [...document.querySelectorAll('[data-setting]')];

  async function initialise() {
    const settings = await api.storage.local.get(defaults);
    controls.forEach(control => { control.checked = settings[control.dataset.setting]; });
  }

  controls.forEach(control => control.addEventListener('change', () => {
    api.storage.local.set({ [control.dataset.setting]: control.checked });
  }));
  initialise();
})();
