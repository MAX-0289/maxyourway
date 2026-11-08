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

function showPhoto(index, updateAddress = false) {
  current = (index + thumbnails.length) % thumbnails.length;
  const thumbnail = thumbnails[current];
  enlarged.src = thumbnail.dataset.enlarge;
  enlarged.alt = thumbnail.querySelector('img').alt;
  caption.textContent = thumbnail.closest('figure').querySelector('figcaption').textContent;
  position.textContent = (current + 1) + ' / ' + thumbnails.length;
  if (updateAddress) history.replaceState(history.state, '', thumbnail.hash);
}

function syncPhotoWithAddress() {
  const index = thumbnails.findIndex(link => link.hash === location.hash);
  if (index < 0) {
    if (dialog.open) dialog.close();
    return;
  }
  showPhoto(index);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('viewing-photo');
}

thumbnails.forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState({galleryReturn: location.href}, '', link.hash);
    syncPhotoWithAddress();
  });
});
window.addEventListener('hashchange', syncPhotoWithAddress);
syncPhotoWithAddress();
controls.hidden = thumbnails.length < 2;
function dismissPhoto() {
  if (history.state?.galleryReturn) {
    history.back();
  } else {
    history.replaceState(null, '', location.pathname + location.search);
    dialog.close();
  }
}

closeButton.addEventListener('click', dismissPhoto);
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  dismissPhoto();
});
previous.addEventListener('click', () => showPhoto(current - 1, true));
next.addEventListener('click', () => showPhoto(current + 1, true));
dialog.addEventListener('close', () => document.body.classList.remove('viewing-photo'));
dialog.addEventListener('click', event => {
  if (event.target === dialog) dismissPhoto();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1), true);
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
    showPhoto(current + (dx < 0 ? 1 : -1), true);
  }
}, {passive:true});
