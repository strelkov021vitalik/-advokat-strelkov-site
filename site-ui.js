(()=>{document.addEventListener('DOMContentLoaded',()=>{document.documentElement.classList.add('motion-ready');

document.querySelectorAll('.menu').forEach(menu=>{if(![...menu.querySelectorAll('a')].some(a=>a.textContent.trim()==='Справочная информация')){const a=document.createElement('a');a.href='/#spravochnaya-informaciya';a.textContent='Справочная информация';a.dataset.referenceNavAdded='true';menu.appendChild(a);}});

document.querySelectorAll('[data-law-chat-open]').forEach(link=>link.addEventListener('click',e=>{const toggle=document.querySelector('.law-chat-toggle');if(toggle){e.preventDefault();toggle.click();}}));

const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion&&'IntersectionObserver'in window){
  const selector=[
    'main > section:not(.hero) .section-head > *',
    'main > section:not(.hero) .card:not(.bitter-card)',
    'main > section:not(.hero) .bitter-card > .num',
    'main > section:not(.hero) .bitter-card > h3',
    'main > section:not(.hero) .bitter-card > p',
    'main > section:not(.hero) .bitter-card > .more',
    'main > section:not(.hero) .situation-card',
    'main > section:not(.hero) .plain-law-grid > a',
    'main > section:not(.hero) .memo-card',
    'main > section:not(.hero) .fact',
    'main > section:not(.hero) .quick-nav',
    'main > section:not(.hero) .checklist',
    'main > section:not(.hero) .brief-box',
    'main > section:not(.hero) .process-line',
    'main > section:not(.hero) .practice-case',
    'main > section:not(.hero) .article > h2',
    'main > section:not(.hero) .article > h3',
    'main > section:not(.hero) .article > h2 + p',
    'main > section:not(.hero) .article > h3 + p',
    'main > section:not(.hero) .article > .callout',
    'main > section:not(.hero) .article > .links'
  ].join(',');
  const targets=[...new Set(document.querySelectorAll(selector))];
  targets.forEach((el,i)=>{
    el.classList.add('reveal-up');
    const parent=el.parentElement;
    if(parent){
      const siblings=[...parent.children].filter(x=>targets.includes(x));
      const pos=Math.max(0,siblings.indexOf(el));
      el.style.setProperty('--reveal-delay',Math.min(pos*32,96)+'ms');
    }
  });
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{rootMargin:'0px 0px -6% 0px',threshold:0.06});
  targets.forEach(el=>observer.observe(el));
}

const article=document.querySelector('.article');
if(article&&document.body.scrollHeight>window.innerHeight*1.55){
  const bar=document.createElement('div');
  bar.className='reading-progress';
  bar.innerHTML='<span></span>';
  document.body.appendChild(bar);
  const fill=bar.firstElementChild;
  const update=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    const pct=max>0?Math.min(100,Math.max(0,scrollY/max*100)):0;
    fill.style.width=pct+'%';
  };
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  update();
}

const root=document.querySelector('[data-materials-filter]');
if(root){
  const grid=document.querySelector('#materials-grid');
  const cards=grid?[...grid.querySelectorAll('.card')]:[];
  const search=root.querySelector('[data-material-search]');
  const buttons=[...root.querySelectorAll('[data-filter]')];
  const category=card=>{
    const t=card.textContent.toLowerCase();
    if(/уголов|ст\. 159|ст\. 160|228|взят|коммерческ.*подкуп|задерж|обыск|допрос/.test(t))return'criminal';
    if(/семейн|алимент|ребён|ребен|супруг/.test(t))return'family';
    if(/дтп|осаго|каско|страхов/.test(t))return'traffic';
    if(/дду|застрой/.test(t))return'ddu';
    if(/вс рф|ксою|кассац|судебн.*практик|судейск|вккс|назначени|кадров/.test(t))return'practice';
    return'civil';
  };
  cards.forEach(card=>card.dataset.category=category(card));
  let active='all';
  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    cards.forEach(card=>{
      const okCat=active==='all'||card.dataset.category===active;
      const okQ=!q||card.textContent.toLowerCase().includes(q);
      card.hidden=!(okCat&&okQ);
    });
  };
  buttons.forEach(button=>button.addEventListener('click',()=>{
    active=button.dataset.filter;
    buttons.forEach(x=>x.classList.toggle('is-active',x===button));
    apply();
  }));
  search?.addEventListener('input',apply);
  apply();
}

document.querySelectorAll('[data-print-page]').forEach(button=>button.addEventListener('click',()=>window.print()));
});})();