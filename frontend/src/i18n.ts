import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

if (!i18n.isInitialized) {
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
          region_has_validated_zero:
            'Aucune région n’a terminé la consultation',
          region_has_validated_one: 'Une région a terminé la consultation',
          region_has_validated_other:
            '{{count}} régions ont terminé la consultation',
          region_has_sent_zero: 'Aucune région n’a diffusé la programmation',
          region_has_sent_one: 'Une région a diffusé la programmation',
          region_has_sent_other:
            '{{count}} régions ont diffusé la programmation',
          department_has_sent_zero:
            'Aucun département n’a diffusé la programmation',
          department_has_sent_one: 'Un département a diffusé la programmation',
          department_has_sent_other:
            '{{count}} départements ont diffusé la programmation',
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
          residue_other: '{{count}} résidus',
          department_zero: 'Aucun département',
          department_one: 'Un département',
          department_other: '{{count}} départements',
          context_zero: 'Aucun contexte',
          context_one: 'Un contexte',
          context_other: '{{count}} contextes',
          select_zero: 'Aucun sélectionné',
          select_one: 'Un sélectionné',
          select_other: '{{count}} sélectionnés',
          comment_zero: 'Aucun commentaire',
          comment_one: 'Un commentaire',
          comment_other: '{{count}} commentaires'
        }
      }
    }
  });
}
