// Keep one soundtrack active across the page, including the homepage selections.
document.addEventListener('play', event => {
  if (!(event.target instanceof HTMLVideoElement)) return;
  document.querySelectorAll('video').forEach(player => {
    if (player !== event.target && !player.paused) player.pause();
  });
}, true);

document.querySelectorAll('[data-reel-carousel]').forEach(section => {
  const row = section.querySelector('.reel-row');
  const slides = Array.from(row.querySelectorAll('.reel-card'));
  const back = section.querySelector('[data-scroll-back]');
  const next = section.querySelector('[data-scroll-next]');
  const count = section.querySelector('.reel-count');
  function currentSlide() {
    const left = row.getBoundingClientRect().left;
    return slides.findIndex(slide => slide.getBoundingClientRect().right > left + 6);
  }
  function update() {
    const first = Math.max(0, currentSlide());
    const right = row.getBoundingClientRect().right;
    const last = slides.reduce((lastVisible, slide, i) =>
      slide.getBoundingClientRect().left < right - 6 ? i : lastVisible, first);
    count.textContent = (first === last ? first + 1 : (first + 1) + '–' + (last + 1)) + ' / ' + slides.length;
    back.disabled = row.scrollLeft <= 2;
    next.disabled = row.scrollWidth - row.clientWidth - row.scrollLeft <= 2;
  }
  function move(direction) {
    const index = Math.max(0,Math.min(slides.length - 1,currentSlide() + direction));
    const offset = slides[index].getBoundingClientRect().left - row.getBoundingClientRect().left;
    row.scrollBy({left:offset,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  back.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  row.addEventListener('keydown', e => {
    if(e.target !== row || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1);
  });
  row.addEventListener('scroll',update,{passive:true});
  new ResizeObserver(update).observe(row);
  update();
});

document.querySelectorAll('[data-clip-choice]').forEach(link => {
  link.addEventListener('click', event => {
    if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const card = link.closest('.reel-card');
    const player = card.querySelector('video');
    if(player.currentSrc !== link.href) player.src = link.href;
    card.querySelectorAll('[data-clip-choice]').forEach(item => {
      if(item === link) item.setAttribute('aria-current','true');
      else item.removeAttribute('aria-current');
    });
    player.play().catch(() => { player.focus(); });
  });
});
