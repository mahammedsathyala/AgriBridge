import { en } from './en.js';
import { te } from './te.js';

const translations = { en, te };
let currentLocale = localStorage.getItem('agribridge_locale') || 'en';
const listeners = new Set();

export function setLocale(locale) {
  if (translations[locale]) {
    currentLocale = locale;
    localStorage.setItem('agribridge_locale', locale);
    
    // Update body classes for typography adjustments
    if (locale === 'te') {
      document.body.classList.add('lang-te');
    } else {
      document.body.classList.remove('lang-te');
    }
    
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
