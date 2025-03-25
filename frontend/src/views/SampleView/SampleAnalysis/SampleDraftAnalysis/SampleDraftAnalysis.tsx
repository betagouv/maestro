import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { AnalysisStatus } from 'maestro-shared/schema/Analysis/AnalysisStatus';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnalysisComplianceStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisComplianceStep/AnalysisComplianceStep';
import AnalysisReportStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisReportStep/AnalysisReportStep';
import AnalysisResiduesStep from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesStep';
import { useSamplesLink } from '../../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../../services/apiClient';

export const AnalysisStepTitles = [
  'Rapport d’analyse',
  'Résidus identifiés',
  "Conformité de l'échantillon"
];

interface Props {
  sample: Sample;
}

export const AnalysisStatusSteps: Partial<Record<AnalysisStatus, number>> = {
  Report: 1,
  Residues: 2,
  Compliance: 3
};

const SampleDraftAnalysis = ({ sample }: Props) => {
  const { getSampleStepParam } = useSamplesLink()
  const apiClient = useContext(ApiClientContext)
  const { data: partialAnalysis, isFetching } = apiClient.useGetSampleAnalysisQuery(
    sample.id
  );

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>();

  useEffect(() => {
    if (!isFetching) {
      if (partialAnalysis) {
        setStep(
          getSampleStepParam() ?? AnalysisStatusSteps[partialAnalysis.status]
        );
      } else {
        setStep(1);
      }
    }
  }, [isFetching, partialAnalysis, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
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
