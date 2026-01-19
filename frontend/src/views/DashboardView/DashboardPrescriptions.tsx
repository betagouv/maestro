import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  filteredLocalPrescriptions,
  getCompletionRate,
  LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  FunctionComponent,
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
  const { user, userDepartment, userCompanies, hasNationalView } =
    useAuthentication();

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
        department: userDepartment,
        companies: userCompanies
      }),
    [localPrescriptionsData, regionFilter, userDepartment, userCompanies]
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

  const realizedPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(({ localPrescriptions }) =>
        localPrescriptions.every(
          (regionalPrescription) =>
            (regionalPrescription.realizedSampleCount as number) >=
            regionalPrescription.sampleCount
        )
      ).length,
    [sortedPrescriptions]
  );

  const inProgressPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(
        ({ localPrescriptions }) =>
          localPrescriptions.some(
            (regionalPrescription) =>
              (regionalPrescription.realizedSampleCount as number) <
              regionalPrescription.sampleCount
          ) &&
          localPrescriptions.some(
            (regionalPrescription) =>
              (regionalPrescription.inProgressSampleCount as number) > 0 ||
              (regionalPrescription.realizedSampleCount as number) > 0
          )
      ).length,
    [sortedPrescriptions]
  );

  const remainingPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(
        ({ localPrescriptions }) =>
          localPrescriptions.every(
            (regionalPrescription) =>
              (regionalPrescription.inProgressSampleCount as number) === 0 &&
              (regionalPrescription.realizedSampleCount as number) === 0
          ) &&
          localPrescriptions.some(
            (regionalPrescription) =>
              (regionalPrescription.realizedSampleCount as number) <
              regionalPrescription.sampleCount
          )
      ).length,
    [sortedPrescriptions]
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
              <div className={clsx('dashboard-prescriptions-progress-header')}>
                <div>
                  <h4 className={cx('fr-mb-0')}>
                    {sortedPrescriptions.length}{' '}
                    {pluralize(sortedPrescriptions.length)(
                      'matrice programmée'
                    )}
                  </h4>
                  {sumBy(localPrescriptions, 'sampleCount')}{' '}
                  {pluralize(sumBy(localPrescriptions, 'sampleCount'))(
                    'prélèvement'
                  )}{' '}
                  à réaliser
                </div>
                <div
                  className={clsx(
                    'd-flex-align-center',
                    cx('fr-text--sm', 'fr-mb-0')
                  )}
                >
                  <CircleProgress
                    progress={getCompletionRate(
                      localPrescriptions ?? [],
                      regionFilter,
                      true
                    )}
                    sizePx={80}
                    type={'percentage'}
                  />
                  <span className={cx('fr-text--bold', 'fr-ml-2w')}>
                    de l'objectif
                  </span>
                </div>
                <div
                  className={clsx(
                    'd-flex-align-center',
                    'border-left',
                    cx('fr-text--sm', 'fr-mb-0')
                  )}
                >
                  <span
                    className={cx(
                      'fr-icon-checkbox-circle-fill',
                      'fr-label--success',
                      'fr-mr-1w',
                      'fr-icon--sm'
                    )}
                    aria-hidden="true"
                  ></span>
                  {realizedPrescriptionsCount}{' '}
                  {pluralize(realizedPrescriptionsCount)('matrice réalisée')}
                  <div className={cx('fr-pl-1w')}>
                    <Tooltip
                      kind="click"
                      title="Transmis au labo, non recevable, en cours d'analyse, à valider, terminé"
                    />
                  </div>
                </div>
                <div
                  className={clsx(
                    'd-flex-align-center',
                    'border-left',
                    cx('fr-text--sm', 'fr-mb-0')
                  )}
                >
                  <span
                    className={clsx(
                      'in-progress',
                      cx('fr-icon-refresh-fill', 'fr-mr-1w', 'fr-icon--sm')
                    )}
                    aria-hidden="true"
                  ></span>
                  {inProgressPrescriptionsCount} en cours
                  <div className={cx('fr-pl-1w')}>
                    <Tooltip kind="click" title="Brouillon, à envoyer" />
                  </div>
                </div>
                <div
                  className={clsx(
                    'd-flex-align-center',
                    'border-left',
                    cx('fr-text--sm', 'fr-mb-0')
                  )}
                >
                  <span
                    className={clsx(
                      'remaining',
                      cx(
                        'fr-icon-error-warning-fill',
                        'fr-mr-1w',
                        'fr-icon--sm'
                      )
                    )}
                    aria-hidden="true"
                  ></span>
                  {remainingPrescriptionsCount}
                  {' non '}
                  {pluralize(remainingPrescriptionsCount)('commencée')}
                </div>
              </div>

              {sortedPrescriptions.length > 0 && (
                <>
                  <hr
                    className={cx('fr-mt-2w', 'fr-mb-3w')}
                    style={{
                      marginLeft: '-2rem',
                      marginRight: '-2rem'
                    }}
                  />
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
    programmingPlanId: programmingPlan.id,
    matrixKind: prescription.matrixKind,
    region: region
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
