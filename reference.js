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
  // Anchor navigation opens the selected court without creating duplicate pages.
  const revealAnchor = () => {
    let target; try {target=document.getElementById(decodeURIComponent(location.hash.slice(1)));} catch {return;}
    if (!target) return;
    for(let p=target; p; p=p.parentElement) if(p.tagName==='DETAILS') p.open=true;
  };
  addEventListener('hashchange', revealAnchor); revealAnchor();
})();
