import { en } from './en.js';
import { te } from './te.js';
import { hi } from './hi.js';

const translations = { en, te, hi };
let currentLocale = localStorage.getItem('agribridge_locale') || 'en';
const listeners = new Set();

// Set initial typography body class
if (currentLocale === 'te') {
  document.body.classList.add('lang-te');
} else if (currentLocale === 'hi') {
  document.body.classList.add('lang-hi');
}

export function setLocale(locale) {
  if (translations[locale]) {
    currentLocale = locale;
    localStorage.setItem('agribridge_locale', locale);
    
    // Update body classes for typography adjustments
    document.body.classList.toggle('lang-te', locale === 'te');
    document.body.classList.toggle('lang-hi', locale === 'hi');
    
    // Notify all reactive UI subscribers
    listeners.forEach(fn => fn(currentLocale));
  }
}

export function getLocale() {
  return currentLocale;
}

export function onLocaleChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Access nested translation string, e.g. t('nav.overview')
 */
export function t(path, fallback = '') {
  const parts = path.split('.');
  let obj = translations[currentLocale];
  for (const part of parts) {
    if (obj && obj[part] !== undefined) {
      obj = obj[part];
    } else {
      // Fallback to English if translation key missing
      let engObj = translations.en;
      for (const p of parts) {
        if (engObj && engObj[p] !== undefined) {
          engObj = engObj[p];
        } else {
          return fallback || path;
        }
      }
      return engObj;
    }
  }
  return obj;
}
