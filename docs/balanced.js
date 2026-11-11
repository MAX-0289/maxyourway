const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('[data-category]')];
function filterProjects(category, updateUrl = false) {
  if (!filters.some(button => button.dataset.filter === category)) category = 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  projects.forEach(project => { project.hidden = category !== 'all' && project.dataset.category !== category; });
  if (updateUrl) {
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    url.hash = 'work';
    history.replaceState(null, '', url);
  }
}
function syncFilter() {
  const hash = location.hash.slice(1);
  const alias = document.getElementById(hash)?.dataset.filterAlias;
  filterProjects(new URLSearchParams(location.search).get('category') || alias || 'all');
}
filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter, true)));
document.querySelectorAll('[data-set]').forEach(link => link.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  filterProjects(link.dataset.set, true);
  document.getElementById('work').scrollIntoView();
}));
window.addEventListener('popstate', syncFilter);
syncFilter();

document.querySelectorAll('.studio-flip').forEach(card => {
  const button = card.querySelector('.studio-flip-toggle');
  const coverLink = card.querySelector('.studio-cover-link');
  const back = card.querySelector('.studio-flip-back');
  button.addEventListener('click', () => {
    const flipped = button.getAttribute('aria-pressed') !== 'true';
    card.classList.toggle('is-flipped', flipped);
    button.setAttribute('aria-pressed', String(flipped));
    coverLink.inert = flipped;
    back.inert = !flipped;
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && card.classList.contains('is-flipped')) {
      button.click();
      button.focus();
    }
  });
});
