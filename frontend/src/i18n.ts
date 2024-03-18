import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'fr',
  resources: {
    fr: {
      translation: {
        boolean_zero: 'Non',
        boolean_one: 'Oui',
        sample_zero: 'Aucun prélèvement',
        sample_one: 'Un prélèvement',
        sample_other: '{{count}} prélèvements',
      },
    },
  },
});

export default i18n;
