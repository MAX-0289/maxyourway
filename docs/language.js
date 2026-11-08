let language = 'zh';
try {
  if (sessionStorage.getItem('maxyourway-language') === 'en') language = 'en';
} catch {}
const languageButton = document.querySelector('#lang');
function applyLanguage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh][data-en]').forEach(element => {
    element.textContent = element.dataset[language].replaceAll('\\n', '\n');
  });
  languageButton.textContent = language === 'zh' ? 'EN' : '中文';
  languageButton.setAttribute('aria-label', language === 'zh' ? 'Switch language to English' : '切换到中文');
  const titles = document.documentElement.dataset;
  document.title = language === 'zh' ? titles.titleZh || 'MaxYourWay — 影像与品牌内容' : titles.titleEn || 'MaxYourWay — Film, Photography & Brand Content';
}
languageButton.addEventListener('click', () => {
  language = language === 'zh' ? 'en' : 'zh';
  try { sessionStorage.setItem('maxyourway-language', language); } catch {}
  applyLanguage();
});
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
