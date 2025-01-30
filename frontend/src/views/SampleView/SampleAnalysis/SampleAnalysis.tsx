import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useState } from 'react';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { CompletedStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from 'src/hooks/usePartialSample';
import {
  useGetSampleAnalysisQuery,
  useUpdateAnalysisMutation,
} from 'src/services/analysis.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import SampleAdmissibility from 'src/views/SampleView/SampleAnalysis/SampleAdmissibility/SampleAdmissibility';
import SampleAnalysisOverview from 'src/views/SampleView/SampleAnalysis/SampleAnalysisOverview/SampleAnalysisOverview';
import SampleDraftAnalysis from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/SampleDraftAnalysis';

interface Props {
  sample: Sample;
}
const SampleAnalysis = ({ sample }: Props) => {
  const { laboratory } = usePartialSample(sample);
  const [, { isSuccess: isSendingSuccess }] = useUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`,
  });
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`,
    });
  const { data: analysis } = useGetSampleAnalysisQuery(sample.id);

  const [continueToAnalysis, setContinueToAnalysis] = useState(false);

  return (
    <div>
      {isSendingSuccess && laboratory && (
        <Alert
          severity="info"
          small
          description={`Votre demande d’analyse a bien été transmise au laboratoire ${laboratory.name} par e-mail.`}
          className={cx('fr-mb-4w')}
        />
      )}
      {CompletedStatusList.includes(sample.status) &&
        isCompletingAnalysisSuccess && (
          <Alert
            severity="info"
            small
            description="Les résultats d’analyse ont bien été enregistrés."
            className={cx('fr-mb-4w')}
          />
        )}
      <div className="section-header">
        <div>
          <h3>
            <div className="sample-status">
              <div>Suivi du prélèvement</div>
              <div>
                <SampleStatusBadge status={sample.status} />
              </div>
            </div>
            {![...CompletedStatusList, 'NotAdmissible'].includes(
              sample.status
            ) && (
              <div
                className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-1w')}
              >
                Renseignez ci-dessous le suivi d’analyse par le laboratoire
              </div>
            )}
          </h3>
        </div>
      </div>
      <SampleAdmissibility sample={sample} />
      {sample.status === 'Analysis' && !analysis && !continueToAnalysis ? (
        <Button
          iconId="fr-icon-arrow-down-line"
          iconPosition="right"
          className="fr-m-0"
          onClick={() => setContinueToAnalysis(true)}
        >
          Saisir le résultat
        </Button>
      ) : (
        <>
          {['Analysis', ...CompletedStatusList].includes(sample.status) && (
            <div
              className={clsx(
                cx(
                  'fr-callout',
                  CompletedStatusList.includes(sample.status)
                    ? 'fr-callout--green-emeraude'
                    : 'fr-callout--pink-tuile'
                ),
                'sample-callout',
                'analysis-container',
                'fr-mt-5w'
              )}
            >
              {sample.status === 'Analysis' && (
                <SampleDraftAnalysis sample={sample} />
              )}
              {CompletedStatusList.includes(sample.status) && (
                <SampleAnalysisOverview sample={sample} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SampleAnalysis;
