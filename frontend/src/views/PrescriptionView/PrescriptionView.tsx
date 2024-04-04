import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import PrescriptionMap from 'src/views/PrescriptionView/PrescriptionMap';
import PrescriptionTable from 'src/views/PrescriptionView/PrescriptionTable';

const PrescriptionView = () => {
  useDocumentTitle('Prescription');

  const { programmingPlanId } = useParams<{ programmingPlanId: string }>();
  const { hasNationalView } = useAuthentication();

  const [view, setView] = useState<'table' | 'map'>('map');

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

  if (!programmingPlan) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-py-6w'))}>
      <h1
        className={cx('fr-mb-0', {
          'fr-container': hasNationalView && view === 'table',
        })}
      >
        {programmingPlan.title}
        <div className={cx('fr-text--lead')}>
          {t('sample', { count: _.sumBy(prescriptions, 'sampleCount') })}
        </div>
      </h1>
      <SegmentedControl
        segments={[
          {
            label: 'Carte',
            nativeInputProps: {
              checked: view === 'map',
              onChange: () => setView('map'),
            },
          },
          {
            label: 'Tableau',
            nativeInputProps: {
              checked: view === 'table',
              onChange: () => setView('table'),
            },
          },
        ]}
        hideLegend={true}
        legend={'Vue'}
        className={cx('fr-pb-1w', {
          'fr-container': hasNationalView && view === 'table',
        })}
        style={{
          display: 'flex',
          margin: 'auto',
        }}
        data-testid="prescription-view-segmented-control"
      />
      {view === 'table' ? (
        <PrescriptionTable
          programmingPlanId={programmingPlan.id}
          prescriptions={prescriptions || []}
        />
      ) : (
        <PrescriptionMap prescriptions={prescriptions || []} />
      )}
    </section>
  );
};

export default PrescriptionView;
