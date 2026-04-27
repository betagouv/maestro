import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  filteredLocalPrescriptions,
  getCompletionRate,
  type LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  type Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  type FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { CircleProgress } from '../../components/CircleProgress/CircleProgress';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import { getURLQuery } from '../../utils/fetchUtils';
import { pluralize } from '../../utils/stringUtils';
import './Dashboard.scss';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  className: string;
};
const DashboardPrescriptions: FunctionComponent<Props> = ({
  programmingPlan,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);
  const { user, hasNationalView } = useAuthentication();

  const [context, setContext] = useState(programmingPlan.contexts[0]);
  const [regionFilter, setRegionFilter] = useState(user?.region);

  useEffect(() => {
    setRegionFilter(user?.region);
  }, [user?.region]);

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      contexts: [context],
      region: Region.safeParse(regionFilter).success ? regionFilter : undefined
    }),
    [programmingPlan.id, context, regionFilter]
  );

  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions
  );

  const { data: localPrescriptionsData } =
    apiClient.useFindLocalPrescriptionsQuery({
      ...findPrescriptionOptions,
      includes: ['sampleCounts']
    });

  const localPrescriptions = useMemo(
    () =>
      filteredLocalPrescriptions(localPrescriptionsData ?? [], {
        region: regionFilter ?? undefined,
        department: user?.department ?? undefined,
        companies: user?.companies
      }),
    [localPrescriptionsData, regionFilter, user]
  );

  const sortedPrescriptions = useMemo(
    () =>
      [...(prescriptions ?? [])]
        .sort(PrescriptionSort)
        .map((prescription) => ({
          prescription,
          localPrescriptions: (localPrescriptions ?? []).filter(
            (regionalPrescription) =>
              regionalPrescription.prescriptionId === prescription.id
          )
        }))
        .filter(({ localPrescriptions }) => localPrescriptions.length > 0),
    [prescriptions, localPrescriptions]
  );

  return (
    <div className={className}>
      <Tabs
        classes={{
          panel: 'white-container'
        }}
        onTabChange={({ tabIndex }) => {
          setContext(programmingPlan.contexts[tabIndex]);
        }}
        tabs={programmingPlan.contexts.map((context) => ({
          label: `${ContextLabels[context]} ${programmingPlan.year}`,
          content: (
            <>
              {sortedPrescriptions.length > 0 && (
                <>
                  <div className={clsx('d-flex-align-center', cx('fr-mb-4w'))}>
                    <h5 className={clsx('flex-grow-1', 'fr-mb-0')}>
                      Détails des prélèvements par matrice
                    </h5>
                    {hasNationalView && (
                      <Select
                        label={<div className={cx('fr-hidden')}>Région</div>}
                        nativeSelectProps={{
                          value: regionFilter ?? '',
                          onChange: (e) =>
                            setRegionFilter(e.target.value as Region),
                          className: cx('fr-mt-0')
                        }}
                      >
                        <option value="">Toutes les régions</option>
                        {RegionList.map((region) => (
                          <option
                            key={`select-region-${region}`}
                            value={region}
                          >
                            {Regions[region].name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                  <div className={cx('fr-grid-row')}>
                    {sortedPrescriptions.map(
                      ({ prescription, localPrescriptions }) => (
                        <DashboardPrescriptionCard
                          key={prescription.id}
                          programmingPlan={programmingPlan}
                          prescription={prescription}
                          localPrescriptions={localPrescriptions}
                          region={regionFilter}
                        />
                      )
                    )}
                  </div>
                </>
              )}
            </>
          )
        }))}
      />
    </div>
  );
};

const DashboardPrescriptionCard: FunctionComponent<{
  programmingPlan: ProgrammingPlanChecked;
  prescription: Prescription;
  localPrescriptions: LocalPrescription[];
  region?: Region | null;
}> = ({ programmingPlan, prescription, localPrescriptions, region }) => {
  const linkQuery = getURLQuery({
    programmingPlanIds: [programmingPlan.id],
    matrixKinds: [prescription.matrixKind],
    regions: [region]
  });

  return (
    <Card
      className={clsx(
        'dashboard-prescription-card',
        cx('fr-col-12', 'fr-col-sm-3')
      )}
      linkProps={{
        to: `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}${linkQuery}`
      }}
      background
      border
      enlargeLink
      title={getPrescriptionTitle(prescription)}
      size="small"
      end={
        <>
          <CircleProgress
            progress={getCompletionRate(localPrescriptions)}
            sizePx={80}
            type="total"
            total={sumBy(localPrescriptions, 'sampleCount')}
            values={[
              sumBy(localPrescriptions, 'realizedSampleCount'),
              sumBy(localPrescriptions, 'inProgressSampleCount')
            ]}
          />
          <div className={cx('fr-pl-2w')}>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'realized')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {sumBy(localPrescriptions, 'realizedSampleCount')}{' '}
                {pluralize(sumBy(localPrescriptions, 'realizedSampleCount'))(
                  'réalisé'
                )}
              </span>
            </div>
            {sumBy(localPrescriptions, 'notAdmissibleSampleCount') > 0 && (
              <div className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                (
                {pluralize(
                  sumBy(localPrescriptions, 'notAdmissibleSampleCount'),
                  {
                    preserveCount: true,
                    ignores: ['non']
                  }
                )('non recevable')}
                )
              </div>
            )}
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'in-progress')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {sumBy(localPrescriptions, 'inProgressSampleCount')} en cours
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'remaining')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {Math.max(
                  0,
                  sumBy(localPrescriptions, 'sampleCount') -
                    sumBy(localPrescriptions, 'realizedSampleCount') -
                    sumBy(localPrescriptions, 'inProgressSampleCount')
                )}{' '}
                à faire
              </span>
            </div>
          </div>
        </>
      }
    ></Card>
  );
};

export default DashboardPrescriptions;
