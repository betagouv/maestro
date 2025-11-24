import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { ResidueResultOverviewOld } from '../SampleAnalysisOverview/ResidueResultOverviewOld';
import { useResiduesForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesForm';
import { ResidueInterpretationForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/ResidueInterpretationForm';

type Props = {
  sample: Sample;
  analysis: Pick<PartialAnalysis, 'residues'>;
  onGoToInterpretation: (residues: Analysis['residues']) => Promise<void>;
  onCorrectAnalysis: (residues: PartialResidue[]) => void;
};
export const ReviewWithResidues: FunctionComponent<Props> = ({
  sample,
  analysis,
  onGoToInterpretation,
  onCorrectAnalysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { residues, form, changeResidue } = useResiduesForm(analysis, sample);

  const onSubmit = async () => {
    await form.validate(async (validInput) => {
      await onGoToInterpretation(validInput.residues);
    });
  };

  const onCorrect = async () => {
    onCorrectAnalysis(residues);
  };

  return (
    <div className={'analysis-container'}>
      <div className={clsx('analysis-container', 'residue-container')}>
        {residues.map((residue, residueIndex) => (
          <div key={`residue-${residueIndex}`} className={clsx('residue-form')}>
            <ResidueResultOverviewOld
              residue={residue}
              residueIndex={residueIndex}
            />
            <div className={clsx('residue-form')}>
              <ResidueInterpretationForm
                form={form}
                onChangeResidue={changeResidue}
                residue={residue}
                residueIndex={residueIndex}
              />
            </div>
          </div>
        ))}
      </div>

      <hr />

      <ButtonsGroup
        inlineLayoutWhen="always"
        alignment="between"
        buttons={[
          {
            children: 'Corriger',
            iconId: 'fr-icon-edit-line',
            priority: 'secondary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onCorrect
          },
          {
            children: "Finaliser l'interprétation",
            priority: 'primary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onSubmit
          }
        ]}
      />
    </div>
  );
};
