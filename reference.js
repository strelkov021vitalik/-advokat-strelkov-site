/* Ordinary valued property claim: NC RF 333.19(1)(1), court govduty 2026-10-03. */
(() => {
  const fee = (amount) => {
    const bands = [
      [100000, 0, 4000, 0], [300000, 100000, 4000, .03],
      [500000, 300000, 10000, .025], [1000000, 500000, 15000, .02],
      [3000000, 1000000, 25000, .01], [8000000, 3000000, 45000, .007],
      [24000000, 8000000, 80000, .0035], [50000000, 24000000, 136000, .003],
      [100000000, 50000000, 214000, .002], [Infinity, 100000000, 314000, .0015]
    ];
    const [, floor, base, rate] = bands.find(([ceiling]) => amount <= ceiling);
    return Math.round(Math.min(900000, base + (amount - floor) * rate));
  };
  document.querySelectorAll('.fee-form').forEach(form => {
    const input = form.elements.claim;
    const output = form.querySelector('output');
    input.addEventListener('input', () => { output.textContent = 'Нажмите «Рассчитать»'; input.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const raw = input.value.trim().replace(/[\s\u00a0]/g, '').replace(',', '.');
      const amount = Number(raw);
      if (!/^\d+(\.\d{1,2})?$/.test(raw) || !Number.isFinite(amount) || amount <= 0 || amount > 1e15) {
        output.textContent = 'Введите положительную сумму в рублях, не более двух знаков после запятой.';
        input.setAttribute('aria-invalid', 'true'); return;
      }
      output.textContent = fee(amount).toLocaleString('ru-RU') + ' ₽ — без льгот и специальных правил';
    });
  });
  // Enhance existing court links into tabs; without JS every court stays readable.
  const picker = document.querySelector('.court-picker');
  const tabs = picker ? [...picker.querySelectorAll('a[href^="#"]')] : [];
  const courts = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  const tabMode = tabs.length > 0 && courts.every(Boolean);
  const selectCourt = (index) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      courts[i].hidden = i !== index;
    });
  };
  if (tabMode) {
    picker.setAttribute('role', 'tablist');
    tabs.forEach((tab, i) => {
      tab.id = 'court-tab-' + courts[i].id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', courts[i].id);
      courts[i].setAttribute('role', 'tabpanel');
      courts[i].setAttribute('aria-labelledby', tab.id);
      courts[i].tabIndex = 0;
      tab.addEventListener('click', () => selectCourt(i));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    });
    selectCourt(0);
  }
  // Preserve direct links and browser back/forward navigation.
  const revealAnchor = () => {
    let target; try {target=document.getElementById(decodeURIComponent(location.hash.slice(1)));} catch {return;}
    if (tabMode) {
      const court = target && target.closest('.court-entry');
      const index = courts.indexOf(court);
      if (index >= 0) selectCourt(index);
      else if (target && target.id === 'higher') selectCourt(courts.length - 1);
      else if (!location.hash || (target && target.id === 'district')) selectCourt(0);
    }
    if (!target) return;
    for(let p=target; p; p=p.parentElement) if(p.tagName==='DETAILS') p.open=true;
  };
  addEventListener('hashchange', revealAnchor); revealAnchor();
})();
