import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import _ from 'lodash';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { Context } from 'shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
import PrescriptionTable from 'src/views/PrescriptionView/PrescriptionTable';

const PrescriptionView = () => {
  useDocumentTitle('Prescription');
  const { programmingPlan } = useAppSelector((state) => state.settings);

  const [searchParams] = useSearchParams();
  const { hasNationalView, userInfos } = useAuthentication();

  const context = useMemo(
    () => searchParams.get('context') as Context,
    [searchParams]
  );

  const region: Region = useMemo(
    () =>
      userInfos?.region ?? (searchParams.get('region') as Region) ?? undefined,
    [userInfos, searchParams]
  );

  const { data: prescriptions } = useFindPrescriptionsQuery(
    {
      programmingPlanId: programmingPlan?.id as string,
      context: context as Context,
      region,
    },
    {
      skip: !programmingPlan || !context,
    }
  );
  const { data: samples } = useFindSamplesQuery(
    {
      programmingPlanId: programmingPlan?.id as string,
      context: context as Context,
      status: 'Sent',
      region,
    },
    {
      skip: !programmingPlan || !context,
    }
  );

  if (!programmingPlan || !context || !prescriptions || !samples) {
    return <></>;
  }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <h1
        className={cx('fr-mb-0', {
          'fr-container': hasNationalView,
        })}
      >
        {ProgrammingPlanStatusLabels[programmingPlan.status]}
        <div className={cx('fr-text--lead')}>
          {region && <>{Regions[region]?.name} - </>}
          {t('sample', { count: _.sumBy(prescriptions, 'sampleCount') })}
        </div>
      </h1>
      <PrescriptionTable
        programmingPlan={programmingPlan}
        context={context}
        prescriptions={prescriptions}
        samples={samples}
        regions={region ? [region] : RegionList}
      />
    </section>
  );
};

export default PrescriptionView;
