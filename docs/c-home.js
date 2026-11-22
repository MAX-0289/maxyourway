(() => {
  'use strict';
  const projects = JSON.parse(document.querySelector('#home-project-data').textContent);
  const buttons = [...document.querySelectorAll('[data-case]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const stage = document.querySelector('#case-stage');
  const front = stage.querySelector('.case-front');
  const back = stage.querySelector('.case-back');
  const flip = stage.querySelector('.flip-button');
  let selected = 0;
  let request = 0;
  let category = 'all';
  const translate = item => localized(item.zh, item.en, item.zhHant);
  const cache = new Map();
  function preload(src) {
    if (!cache.has(src)) {
      cache.set(src, new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => { cache.delete(src); resolve(false); };
        image.src = src;
        if (image.complete && image.naturalWidth) resolve(true);
      }));
    }
    return cache.get(src);
  }
  function updateCopy() {
    const project = projects[selected];
    for (const [selector, value] of [['#case-name', project.title], ['#case-label', project.label], ['#case-description', project.description]]) {
      document.querySelector(selector).textContent = translate(value);
    }
    document.querySelector('.case-link').href = project.href;
  }
  function populate(face, sources, companion, portrait) {
    const items = [...sources];
    if (portrait && items.length === 1) items.push(...companion.slice(0, 1));
    const images = items.map(item => {
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt;
      image.decoding = 'async';
      return image;
    });
    face.replaceChildren(...images);
  }
  function unflip() {
    stage.classList.remove('is-flipped');
    flip.setAttribute('aria-pressed', 'false');
    front.inert = false;
    back.inert = true;
  }
  async function choose(index, force = false) {
    const token = ++request;
    if (index === selected && !force) { stage.removeAttribute('aria-busy'); return; }
    const project = projects[index];
    const sources = [...project.front, ...(project.back.length ? project.back : project.front)];
    stage.setAttribute('aria-busy', 'true');
    const ready = await Promise.all(sources.map(item => preload(item.src)));
    if (token !== request) return;
    stage.removeAttribute('aria-busy');
    if (!ready.every(Boolean)) return;
    selected = index;
    unflip();
    stage.classList.toggle('is-portrait', Boolean(project.portrait));
    populate(front, project.front, project.back, project.portrait);
    populate(back, project.back.length ? project.back : project.front, project.front, project.portrait);
    buttons.forEach(button => {
      const active = Number(button.dataset.case) === selected;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateCopy();
  }
  buttons.forEach(button => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) choose(Number(button.dataset.case));
    });
    button.addEventListener('focus', () => {
      if (matchMedia('(hover: hover)').matches) choose(Number(button.dataset.case));
    });
    button.addEventListener('click', () => choose(Number(button.dataset.case)));
    button.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const visible = buttons.filter(item => !item.hidden);
      const position = visible.indexOf(button);
      const target = visible[(position + (event.key === 'ArrowDown' ? 1 : visible.length - 1)) % visible.length];
      target.focus({ preventScroll: true });
      choose(Number(target.dataset.case));
    });
  });
  flip.addEventListener('click', () => {
    const flipped = !stage.classList.contains('is-flipped');
    stage.classList.toggle('is-flipped', flipped);
    flip.setAttribute('aria-pressed', String(flipped));
    front.inert = flipped;
    back.inert = !flipped;
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'Escape' && stage.classList.contains('is-flipped')) { unflip(); flip.focus(); }
  });
  function setFilter(value, updateUrl = false) {
    request += 1;
    stage.removeAttribute('aria-busy');
    category = ['all', 'social', 'films'].includes(value) ? value : 'all';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    buttons.forEach(button => { button.hidden = category !== 'all' && button.dataset.category !== category; });
    if (buttons[selected].hidden) choose(Number(buttons.find(button => !button.hidden).dataset.case));
    if (updateUrl) {
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', category);
      url.hash = 'work';
      history.replaceState(null, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter, true)));
  function syncLocation() {
    const value = new URLSearchParams(location.search).get('category');
    if (value === 'photography') {
      setFilter('all');
      document.querySelector('#photography').scrollIntoView();
    } else setFilter(value || 'all');
  }
  window.addEventListener('popstate', syncLocation);
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', updateCopy));
  const header = document.querySelector('.site-header');
  const scrollState = () => header.classList.toggle('is-scrolled', window.scrollY > 35);
  window.addEventListener('scroll', scrollState, { passive: true });
  scrollState();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      document.querySelectorAll('.primary-nav a[href^="#"],.mobile-shortcuts a[href^="#"]').forEach(link => {
        if (link.hash === '#' + active.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-140px 0px -30% 0px', threshold: [0, .2, .6] });
    document.querySelectorAll('#services,#work,#photography,#about').forEach(section => observer.observe(section));
  }
  updateCopy();
  syncLocation();
  const warm = () => projects.slice(0, 3).forEach(project => [...project.front, ...project.back].forEach(image => preload(image.src)));
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 1800 });
  else setTimeout(warm, 500);
})();
