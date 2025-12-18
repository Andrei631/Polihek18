import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getDeviceLanguage } from './language';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ro from './locales/ro.json';

export const DEFAULT_LANGUAGE = getDeviceLanguage();

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ro: { translation: ro },
        de: { translation: de },
        es: { translation: es },
        fr: { translation: fr },
        it: { translation: it },
        pt: { translation: pt },
      },
      lng: DEFAULT_LANGUAGE,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
    });
}

export default i18n;
