import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import { AnalysisStatus } from 'shared/schema/Analysis/AnalysisStatus';
import { Sample } from 'shared/schema/Sample/Sample';
import { useGetSampleAnalysisQuery } from 'src/services/analysis.service';
import AnalysisComplianceStep from 'src/views/SampleView/SampleAnalysis/AnalysisComplianceStep/AnalysisComplianceStep';
import AnalysisReportStep from 'src/views/SampleView/SampleAnalysis/AnalysisReportStep/AnalysisReportStep';
import AnalysisResiduesStep from 'src/views/SampleView/SampleAnalysis/AnalysisResiduesStep/AnalysisResiduesStep';

export const AnalysisStepTitles = (analysis?: PartialAnalysis) => [
  'Rapport d’analyse',
  'Résidus identifiés',
  "Conformité de l'échantillon",
];

interface Props {
  sample: Sample;
}

const SampleAnalysis = ({ sample }: Props) => {
  const { data: partialAnalysis } = useGetSampleAnalysisQuery(sample.id);

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>();

  const AnalysisStatusSteps: Partial<Record<AnalysisStatus, number>> = {
    Report: 1,
    Residues: 2,
    Compliance: 3,
    Completed: 4,
  };

  useEffect(() => {
    if (partialAnalysis) {
      if (searchParams.get('etape')) {
        setStep(Number(searchParams.get('etape')));
      } else {
        setStep(AnalysisStatusSteps[partialAnalysis.status]);
      }
    } else {
      setStep(1);
    }
  }, [partialAnalysis, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={clsx(
        cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mt-5w'),
        'sample-callout'
      )}
    >
      <h4 className={cx('fr-mb-0')}>
        <div className={cx('fr-label--error', 'fr-text--sm')}>ETAPE 2</div>
        Saisie des résultats d’analyse
        <div className={cx('fr-text--md', 'fr-text--regular')}>
          Renseignez les résultats du rapport d’analyse
        </div>
      </h4>
      {step && (
        <Stepper
          currentStep={step}
          nextTitle={AnalysisStepTitles(partialAnalysis)[step]}
          stepCount={3}
          title={AnalysisStepTitles(partialAnalysis)[step - 1]}
          className={cx('fr-mb-0')}
        />
      )}
      <hr />
      {step === 1 && (
        <AnalysisReportStep
          sampleId={sample.id}
          partialAnalysis={partialAnalysis}
        />
      )}
      {step === 2 && (
        <AnalysisResiduesStep
          partialAnalysis={partialAnalysis as PartialAnalysis}
        />
      )}
      {step === 3 && (
        <AnalysisComplianceStep
          partialAnalysis={partialAnalysis as PartialAnalysis}
        />
      )}
      {step === 4 && (
        <div>
          <h4>Résulats enregistrés</h4>
        </div>
      )}
    </div>
  );
};

export default SampleAnalysis;
