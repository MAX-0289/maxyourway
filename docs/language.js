const localeTags = { zh: 'zh-CN', zhHant: 'zh-Hant-HK', en: 'en' };
let language = 'zh';
try {
  const preference = localStorage.getItem('maxyourway-language') || sessionStorage.getItem('maxyourway-language');
  if (Object.hasOwn(localeTags, preference)) language = preference;
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
