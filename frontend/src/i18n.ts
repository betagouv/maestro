import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'fr',
  resources: {
    fr: {
      translation: {
        analysis_zero: 'Aucune analyse',
        analysis_one: 'Une analyse',
        analysis_other: '{{count}} analyses',
        boolean_zero: 'Non',
        boolean_one: 'Oui',
        has_been_commented_zero: "n'a été commentée",
        has_been_commented_one: 'a été commentée',
        has_been_commented_other: 'ont été commentées',
        region_has_validated_zero: 'Aucune région n’a terminé la consultation',
        region_has_validated_one: 'Une région a terminé la consultation',
        region_has_validated_other:
          '{{count}} régions ont terminé la consultation',
        matrix_zero: 'Aucune matrice',
        matrix_one: 'Une matrice',
        matrix_other: '{{count}} matrices',
        programmingPlan_zero: 'Aucun plan',
        programmingPlan_one: 'Un plan',
        programmingPlan_other: '{{count}} plans',
        sample_zero: 'Aucun prélèvement',
        sample_one: 'Un prélèvement',
        sample_other: '{{count}} prélèvements',
        plannedSample_zero: 'Aucun prélèvement programmé',
        plannedSample_one: 'Un prélèvement programmé',
        plannedSample_other: '{{count}} prélèvements programmés',
        document_zero: 'Aucun document',
        document_one: 'Un document',
        document_other: '{{count}} documents ressources',
        residue_zero: 'Aucun résidu',
        residue_one: 'Un résidu',
        residue_other: '{{count}} résidus'
      }
    }
  }
});

