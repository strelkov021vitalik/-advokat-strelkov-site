/* Court fee calculators and reference-page interactions. Verified 2026-10-05. */
(() => {
  const generalPropertyFee = (amount) => {
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

  const arbitrationPropertyFee = (amount) => {
    let result;
    if (amount <= 100000) result = 10000;
    else if (amount <= 1000000) result = 10000 + (amount - 100000) * .05;
    else if (amount <= 10000000) result = 55000 + (amount - 1000000) * .03;
    else if (amount <= 50000000) result = 325000 + (amount - 10000000) * .01;
    else result = 725000 + (amount - 50000000) * .005;
    return Math.round(Math.min(10000000, result));
  };

  const parseAmount = (value) => {
    const raw = value.trim().replace(/[\s\u00a0]/g, '').replace(',', '.');
    const amount = Number(raw);
    return /^\d+(\.\d{1,2})?$/.test(raw) && Number.isFinite(amount) && amount > 0 && amount <= 1e15 ? amount : null;
  };

  document.querySelectorAll('.fee-form').forEach(form => {
    const input = form.elements.claim;
    if (!input) return;
    const output = form.querySelector('output');
    input.addEventListener('input', () => { output.textContent = 'Нажмите «Рассчитать»'; input.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const amount = parseAmount(input.value);
      if (amount === null) {
        output.textContent = 'Введите положительную сумму в рублях, не более двух знаков после запятой.';
        input.setAttribute('aria-invalid', 'true'); return;
      }
      output.textContent = generalPropertyFee(amount).toLocaleString('ru-RU') + ' ₽ — без льгот и специальных правил';
    });
  });

  document.querySelectorAll('.fee-advanced-form').forEach(form => {
    const system = form.elements.system;
    const type = form.elements.type;
    const payer = form.elements.payer;
    const amountInput = form.elements.amount;
    const amountWrap = form.querySelector('[data-amount-wrap]');
    const output = form.querySelector('output');

    const fixedFees = {
      general: {
        nonproperty: {individual: 3000, organization: 20000},
        appeal: {individual: 3000, organization: 15000},
        cassation: {individual: 5000, organization: 20000},
        supreme: {individual: 7000, organization: 25000}
      },
      arbitration: {
        nonproperty: {individual: 15000, organization: 50000},
        appeal: {individual: 10000, organization: 30000},
        cassation: {individual: 20000, organization: 50000},
        supreme: {individual: 30000, organization: 80000}
      }
    };

    const sync = () => {
      const needsAmount = type.value === 'property';
      amountWrap.hidden = !needsAmount;
      amountInput.required = needsAmount;
      output.textContent = 'Нажмите «Рассчитать»';
    };
    [system, type, payer].forEach(el => el.addEventListener('change', sync));
    amountInput.addEventListener('input', () => amountInput.removeAttribute('aria-invalid'));
    sync();

    form.addEventListener('submit', event => {
      event.preventDefault();
      let result;
      if (type.value === 'property') {
        const amount = parseAmount(amountInput.value);
        if (amount === null) {
          output.textContent = 'Введите корректную цену иска.';
          amountInput.setAttribute('aria-invalid', 'true'); return;
        }
        result = system.value === 'arbitration' ? arbitrationPropertyFee(amount) : generalPropertyFee(amount);
      } else {
        result = fixedFees[system.value]?.[type.value]?.[payer.value];
      }
      if (!Number.isFinite(result)) {
        output.textContent = 'Не удалось рассчитать пошлину для выбранных параметров.'; return;
      }
      output.textContent = result.toLocaleString('ru-RU') + ' ₽ — базовый размер без учёта льгот и специальных правил';
    });
  });

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