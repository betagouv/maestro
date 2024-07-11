import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Sample } from 'shared/schema/Sample/Sample';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import SampleAdmissibility from 'src/views/SampleView/SampleAdmissibility/SampleAdmissibility';
import SampleAnalysis from 'src/views/SampleView/SampleAnalysis/SampleAnalysis';

interface Props {
  sample: Sample;
}
const SampleMonitoringTab = ({ sample }: Props) => {
  const [, { isSuccess: isSendingSuccess }] = useUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`,
  });
  const { data: laboratory } = useGetLaboratoryQuery(sample.laboratoryId, {
    skip: !isSendingSuccess,
  });

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
      <div className="section-header">
        <div>
          <h3>
            <div className="sample-status">
              <div>Suivi du prélèvement</div>
              <div>
                <SampleStatusBadge status={sample.status} />
              </div>
            </div>
            <div className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-1w')}>
              Renseignez ci-dessous le suivi d’analyse par le laboratoire
            </div>
          </h3>
        </div>
      </div>
      <SampleAdmissibility sample={sample} />
      {sample.status === 'Analysis' && <SampleAnalysis sample={sample} />}
    </div>
  );
};

export default SampleMonitoringTab;
