import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import React, { useState } from 'react';
import { Analysis, PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';

interface Props {
  partialAnalysis: PartialAnalysis;
}

const AnalysisComplianceStep = ({ partialAnalysis }: Props) => {
  const { navigateToSample } = useSamplesLink();

  const [updateAnalysis] = useUpdateAnalysisMutation({
    fixedCacheKey: `complete-analysis-${partialAnalysis.sampleId}`,
  });

  const [compliance, setCompliance] = useState(partialAnalysis.compliance);
  const [notesOnCompliance, setNotesOnCompliance] = useState(
    partialAnalysis.notesOnCompliance
  );

  const Form = Analysis.pick({
    compliance: true,
    notesOnCompliance: true,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await updateAnalysis({
        ...partialAnalysis,
        compliance,
        notesOnCompliance,
        status: 'Completed',
      });
      navigateToSample(partialAnalysis.sampleId);
    });
  };

  const form = useForm(Form, {
    compliance,
    notesOnCompliance,
  });

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12')}>
        <AppRadioButtons<FormShape>
          legend="Conformité globale de l'échantillon"
          options={[
            {
              label: 'Échantillon conforme',
              nativeInputProps: {
                checked: compliance === true,
                onChange: () => setCompliance(true),
              },
              illustration: <img src={check} alt="" aria-hidden />,
            },
            {
              label: 'Échantillon non conforme',
              nativeInputProps: {
                checked: compliance === false,
                onChange: () => setCompliance(false),
              },
              illustration: <img src={close} alt="" aria-hidden />,
            },
          ]}
          colSm={6}
          inputForm={form}
          inputKey="compliance"
          whenValid="Conformité de l'échantillon correctement renseignée"
          required
        />
      </div>
      <div className={cx('fr-col-12')}>
        <AppTextInput<FormShape>
          value={notesOnCompliance ?? ''}
          onChange={(e) => setNotesOnCompliance(e.target.value)}
          inputForm={form}
          inputKey="notesOnCompliance"
          whenValid="Note additionnelle correctement renseignée"
          label="Note additionnelle"
          hintText="Champ facultatif pour précisions supplémentaires"
        />
      </div>
      <hr />
      <div className={cx('fr-col-12')}>
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          alignment="between"
          buttons={[
            {
              priority: 'tertiary',
              onClick: async (e) => {
                e.preventDefault();
                await updateAnalysis({
                  ...partialAnalysis,
                  status: 'Residues',
                });
                navigateToSample(partialAnalysis.sampleId, 2);
              },
              title: 'Retour',
              iconId: 'fr-icon-arrow-left-line',
            },
            {
              children: 'Enregistrer le résultat',
              iconId: 'fr-icon-save-line',
              onClick: submit,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AnalysisComplianceStep;
