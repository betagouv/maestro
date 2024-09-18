import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import { AnalysisStatus } from 'shared/schema/Analysis/AnalysisStatus';
import { Sample } from 'shared/schema/Sample/Sample';
import {
  getAnalysisExtractURL,
  useGetSampleAnalysisQuery,
} from 'src/services/analysis.service';
import AnalysisComplianceStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisComplianceStep/AnalysisComplianceStep';
import AnalysisReportStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisReportStep/AnalysisReportStep';
import AnalysisResiduesStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesStep';

export const AnalysisStepTitles = [
  'Rapport d’analyse',
  'Résidus identifiés',
  "Conformité de l'échantillon",
];

interface Props {
  sample: Sample;
}

export const AnalysisStatusSteps: Partial<Record<AnalysisStatus, number>> = {
  Report: 1,
  Residues: 2,
  Compliance: 3,
};

const SampleDraftAnalysis = ({ sample }: Props) => {
  const { data: partialAnalysis } = useGetSampleAnalysisQuery(sample.id);

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>();

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
    <>
      {partialAnalysis?.id && (
        <Button
          className={cx('fr-mr-2w')}
          linkProps={{
            to: getAnalysisExtractURL(partialAnalysis as PartialAnalysis),
            target: '_blank',
          }}
        >
          Test extraction
        </Button>
      )}
      <h4 className={cx('fr-mb-0')}>
        Saisie des résultats d’analyse
        <div className={cx('fr-text--md', 'fr-text--regular')}>
          Renseignez les résultats du rapport d’analyse
        </div>
      </h4>
      {step && (
        <Stepper
          currentStep={step}
          nextTitle={AnalysisStepTitles[step]}
          stepCount={3}
          title={AnalysisStepTitles[step - 1]}
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
    </>
  );
};

export default SampleDraftAnalysis;
