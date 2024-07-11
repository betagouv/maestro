import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analysis, PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';

interface Props {
  partialAnalysis: PartialAnalysis;
}

const AnalysisComplianceStep = ({ partialAnalysis }: Props) => {
  const navigate = useNavigate();
  const [updateAnalysis] = useUpdateAnalysisMutation();

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
      navigate(`/prelevements/${partialAnalysis.sampleId}`, {
        replace: true,
      });
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
      <ButtonsGroup
        inlineLayoutWhen="sm and up"
        buttons={[
          {
            priority: 'tertiary',
            onClick: async (e) => {
              e.preventDefault();
              //TODO await onSave();
              navigate(`/prelevements/${partialAnalysis.sampleId}?etape=2`, {
                replace: true,
              });
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
  );
};

export default AnalysisComplianceStep;
