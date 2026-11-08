const dialog = document.querySelector('#gallery-view');
const enlarged = dialog.querySelector('img');
const caption = dialog.querySelector('p');
const closeButton = dialog.querySelector('button');
const thumbnails = Array.from(document.querySelectorAll('[data-enlarge]'));
const controls = document.createElement('div');
controls.className = 'gallery-controls';
controls.innerHTML = '<button type="button" aria-label="上一张 / Previous photograph">‹</button><output aria-live="polite"></output><button type="button" aria-label="下一张 / Next photograph">›</button>';
dialog.append(controls);
const [previous, next] = controls.querySelectorAll('button');
const position = controls.querySelector('output');
let current = 0;

function showPhoto(index) {
  current = (index + thumbnails.length) % thumbnails.length;
  const thumbnail = thumbnails[current];
  enlarged.src = thumbnail.dataset.enlarge;
  enlarged.alt = thumbnail.querySelector('img').alt;
  caption.textContent = thumbnail.closest('figure').querySelector('figcaption').textContent;
  position.textContent = (current + 1) + ' / ' + thumbnails.length;
}
thumbnails.forEach((button, index) => {
  button.addEventListener('click', () => {
    showPhoto(index);
    dialog.showModal();
    document.body.classList.add('viewing-photo');
  });
});
controls.hidden = thumbnails.length < 2;
closeButton.addEventListener('click', () => dialog.close());
previous.addEventListener('click', () => showPhoto(current - 1));
next.addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('close', () => document.body.classList.remove('viewing-photo'));
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let start = null;
dialog.addEventListener('touchstart', event => {
  const touch = event.touches[0];
  start = event.touches.length === 1 ? {x: touch.clientX, y: touch.clientY} : null;
}, {passive:true});
dialog.addEventListener('touchcancel', () => { start = null; });
dialog.addEventListener('touchend', event => {
  if (!start) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
  start = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    showPhoto(current + (dx < 0 ? 1 : -1));
  }
}, {passive:true});
