import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'fr',
  resources: {
    fr: {
      translation: {},
    },
  },
});

export default i18n;
