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
  for (const attribute of ['alt', 'aria-label']) {
    document.querySelectorAll(`[data-${attribute}-zh]`).forEach(element => {
      const text = element.getAttribute(`data-${attribute}-zh`);
      const translation = localized(text, element.getAttribute(`data-${attribute}-en`) ?? text, element.getAttribute(`data-${attribute}-zh-hant`) ?? text);
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
if (siteHeader) {
  const updateHeaderShadow = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 28);
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();
}

const navigationMenu = document.querySelector('.nav-menu');
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
