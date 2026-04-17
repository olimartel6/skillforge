import { useCallback } from 'react';
import en, { TranslationKey } from './en';
import fr from './fr';
import es from './es';

const translations: Record<string, Record<string, string>> = { en, fr, es };

function getDeviceLanguage(): string {
  try {
    const { getLocales } = require('expo-localization');
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const lang = locales[0].languageCode ?? 'en';
      if (lang in translations) return lang;
    }
  } catch (e) { console.warn('Device language detection failed:', e); }
  return 'en';
}

const currentLanguage = getDeviceLanguage();
const currentTranslations = translations[currentLanguage] || en;

/**
 * Translate a key, with optional interpolation.
 * Usage: t('skillTree.nodesUnlocked', { unlocked: 3, total: 10 })
 */
export function t(key: TranslationKey | string, params?: Record<string, string | number>): string {
  let text = (currentTranslations as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }
  return text;
}

/**
 * React hook that returns the t() function.
 * Keeps compatibility with hook-based patterns.
 */
export function useTranslation() {
  return { t: useCallback(t, []) };
}

export { currentLanguage };
