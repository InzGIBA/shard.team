/* ============================================================
   SHARD Team — i18n Module (alpinejs-i18n library)
   Uses: https://github.com/rehhouari/alpinejs-i18n
   Loads translations from i18n/{lang}.json files (nested format).
   ============================================================ */

const SUPPORTED_LANGS = ['en', 'ru', 'kz'];
const STORAGE_KEY = 'shard-lang';

function detectLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('kk') || nav.startsWith('kz')) return 'kz';
  return 'en';
}

async function loadAllTranslations() {
  const messages = {};
  await Promise.all(
    SUPPORTED_LANGS.map(async (lang) => {
      const res = await fetch(`i18n/${lang}.json`);
      if (!res.ok) throw new Error(`Failed to load i18n/${lang}.json`);
      messages[lang] = await res.json();
    })
  );
  return messages;
}

/* Listen for locale changes to persist choice and update <html lang> */
document.addEventListener('alpine-i18n:locale-change', () => {
  const lang = window.AlpineI18n.locale;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
});

/* Expose supported languages as an Alpine store */
document.addEventListener('alpine:init', () => {
  Alpine.store('i18nLangs', SUPPORTED_LANGS);
});

/* Pre-load translations, then initialize Alpine + alpinejs-i18n */
(async () => {
  const locale = detectLang();
  const messages = await loadAllTranslations();

  document.addEventListener('alpine-i18n:ready', () => {
    window.AlpineI18n.create(locale, messages);
    window.AlpineI18n.fallbackLocale = 'en';
    document.documentElement.lang = locale;
  });

  /* Year helper */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = '\u00A9 ' + new Date().getFullYear();

  /* Start Alpine after translations and plugin are ready */
  Alpine.start();
})();
