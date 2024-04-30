import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import PrescriptionTable from 'src/views/PrescriptionView/PrescriptionTable';

const PrescriptionView = () => {
  useDocumentTitle('Prescription');

  const { programmingPlanId } = useParams<{ programmingPlanId: string }>();
  const { hasNationalView } = useAuthentication();

  const { data: programmingPlan } = useGetProgrammingPlanQuery(
    programmingPlanId as string,
    {
      skip: !programmingPlanId,
    }
  );
  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: programmingPlanId as string },
    {
      skip: !programmingPlanId,
    }
  );
  const { data: samples } = useFindSamplesQuery(
    {
      programmingPlanId: programmingPlanId as string,
      status: 'Sent',
    },
    {
      skip: !programmingPlanId,
    }
  );

  if (!programmingPlan || !prescriptions || !samples) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-py-6w'))}>
      <h1
        className={cx('fr-mb-0', {
          'fr-container': hasNationalView,
        })}
      >
        {programmingPlan.title}
        <div className={cx('fr-text--lead')}>
          {t('sample', { count: _.sumBy(prescriptions, 'sampleCount') })}
        </div>
      </h1>
      <PrescriptionTable
        programmingPlan={programmingPlan}
        prescriptions={prescriptions}
        samples={samples}
      />
    </section>
  );
};

export default PrescriptionView;
