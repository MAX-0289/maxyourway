const localeTags = { zh: 'zh-CN', zhHant: 'zh-Hant-HK', en: 'en' };
let language = 'zh';

function normalizeLang(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (s === 'en' || s.startsWith('en-')) return 'en';
  if (s === 'zhhant' || s === 'zh-hant' || s === 'zh_hant' || s === 'zh-hk' || s === 'zh-tw' || s === 'zh-mo' || s === 'tc' || s === 'hk' || s === 'mo') return 'zhHant';
  if (s === 'zh' || s === 'zh-cn' || s === 'zh-hans' || s === 'sc' || s === 'cn') return 'zh';
  return null;
}

try {
  const paramLang = normalizeLang(new URLSearchParams(location.search).get('lang'));
  if (paramLang) {
    language = paramLang;
    try { localStorage.setItem('maxyourway-language', language); } catch {}
  } else {
    const preference = normalizeLang(localStorage.getItem('maxyourway-language') || sessionStorage.getItem('maxyourway-language'));
    if (preference) {
      language = preference;
    } else if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = normalizeLang(navigator.language);
      if (navLang) language = navLang;
    }
  }
} catch {}

function localized(zh, en, zhHant = zh) {
  return { zh, zhHant, en }[language];
}

const languageButtons = document.querySelectorAll('[data-lang]');
function applyLanguage() {
  document.documentElement.lang = localeTags[language];
  document.querySelectorAll('[data-zh][data-en]').forEach(element => {
    element.textContent = localized(element.dataset.zh, element.dataset.en, element.dataset.zhHant).replaceAll('\\n', '\n');
  });
  for (const attribute of ['alt', 'aria-label', 'data-case-label', 'placeholder']) {
    document.querySelectorAll(`[data-${attribute}-zh]`).forEach(element => {
      const text = element.getAttribute(`data-${attribute}-zh`);
      const translation = localized(
        text,
        element.getAttribute(`data-${attribute}-en`) ?? text,
        element.getAttribute(`data-${attribute}-zh-hant`) ?? text
      );
      element.setAttribute(attribute, translation);
    });
  }
  languageButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });
  const titles = document.documentElement.dataset;
  document.title = localized(titles.titleZh, titles.titleEn, titles.titleZhHant) || 'MaxYourWay';
}

languageButtons.forEach(button => button.addEventListener('click', () => {
  language = button.dataset.lang;
  try { localStorage.setItem('maxyourway-language', language); } catch {}
  applyLanguage();
}));
applyLanguage();

const siteHeader = document.querySelector('.site-header');
const navigationMenu = document.querySelector('.nav-menu');
if (siteHeader) {
  let shortcutScrollY = window.scrollY;
  const updateHeaderState = () => {
    const y = window.scrollY;
    siteHeader.classList.toggle('is-scrolled', y > 28);
    if (y <= 420 || (navigationMenu && navigationMenu.open)) {
      siteHeader.classList.remove('shortcuts-hidden');
      shortcutScrollY = y;
    } else if (siteHeader.classList.contains('shortcuts-hidden')) {
      shortcutScrollY = Math.max(shortcutScrollY, y);
      if (shortcutScrollY - y >= 8) {
        siteHeader.classList.remove('shortcuts-hidden');
        shortcutScrollY = y;
      }
    } else {
      shortcutScrollY = Math.min(shortcutScrollY, y);
      if (y > 520 && y - shortcutScrollY >= 8) {
        siteHeader.classList.add('shortcuts-hidden');
        shortcutScrollY = y;
      }
    }
  };
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

if (navigationMenu) {
  document.addEventListener('click', event => {
    if (navigationMenu.open && (!navigationMenu.contains(event.target) || event.target.closest('a'))) {
      navigationMenu.open = false;
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigationMenu.open) {
      navigationMenu.open = false;
      navigationMenu.querySelector('summary').focus();
    }
  });
}

document.querySelectorAll('[data-copy-wechat]').forEach(button => {
  button.addEventListener('click', async () => {
    const wechatId = button.dataset.copyWechat || '+85365364953';
    const statusEl = document.querySelector(button.dataset.statusTarget || '.wechat-copy-status');
    try {
      await navigator.clipboard.writeText(wechatId);
      if (statusEl) {
        statusEl.textContent = localized(
          `已复制微信号 / WhatsApp：${wechatId}`,
          `Copied WeChat / WhatsApp ID: ${wechatId}`,
          `已複製微信號 / WhatsApp：${wechatId}`
        );
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = localized(
          `请手动添加微信号：${wechatId}`,
          `Please add WeChat ID manually: ${wechatId}`,
          `請手動新增微信號：${wechatId}`
        );
      }
    }
  });
});

// Universal single-active-video guard across films, social reels, and case pages
document.addEventListener('play', event => {
  if (!(event.target instanceof HTMLVideoElement)) return;
  document.querySelectorAll('video').forEach(player => {
    if (player !== event.target && !player.paused) player.pause();
  });
}, true);

// Horizontal strip carousel controls for live photo albums
document.querySelectorAll('[data-strip-carousel]').forEach(card => {
  const strip = card.querySelector('.live-strip');
  if (!strip) return;
  const slides = Array.from(strip.querySelectorAll('.live-figure'));
  const back = card.querySelector('[data-strip-back]');
  const next = card.querySelector('[data-strip-next]');
  const count = card.querySelector('.strip-count');
  if (!slides.length || !back || !next || !count) return;

  function currentSlide() {
    const left = strip.getBoundingClientRect().left;
    const idx = slides.findIndex(slide => slide.getBoundingClientRect().right > left + 8);
    return idx === -1 ? 0 : idx;
  }

  function update() {
    const first = Math.max(0, currentSlide());
    const right = strip.getBoundingClientRect().right;
    const last = slides.reduce(
      (lastVisible, slide, i) => (slide.getBoundingClientRect().left < right - 8 ? i : lastVisible),
      first
    );
    count.textContent = (first === last ? first + 1 : `${first + 1}–${last + 1}`) + ` / ${slides.length}`;
    back.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollWidth - strip.clientWidth - strip.scrollLeft <= 2;
  }

  function move(direction) {
    const index = Math.max(0, Math.min(slides.length - 1, currentSlide() + direction));
    const offset = slides[index].getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollBy({
      left: offset,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  back.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  strip.addEventListener('keydown', event => {
    if (event.target !== strip || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  strip.addEventListener('scroll', update, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(strip);
  update();
});
