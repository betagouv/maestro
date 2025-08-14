import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import {
  ContextLabels,
  ProgrammingPlanContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
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
import { pluralize } from '../../utils/stringUtils';
import './Dashboard.scss';

type Props = {
  programmingPlan: ProgrammingPlan;
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
      context,
      region: Region.safeParse(regionFilter).success ? regionFilter : undefined
    }),
    [programmingPlan.id, context, regionFilter]
  );

  const { data: prescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery({
      ...findPrescriptionOptions,
      includes: ['sampleCounts']
    });

  const sortedPrescriptions = useMemo(
    () =>
      [...(prescriptions ?? [])]
        .sort(PrescriptionSort)
        .map((prescription) => ({
          prescription,
          regionalPrescriptions: (regionalPrescriptions ?? []).filter(
            (regionalPrescription) =>
              regionalPrescription.prescriptionId === prescription.id
          )
        }))
        .filter(
          ({ regionalPrescriptions }) => regionalPrescriptions.length > 0
        ),
    [prescriptions, regionalPrescriptions]
  );

  const realizedPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(({ regionalPrescriptions }) =>
        regionalPrescriptions.every(
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
        ({ regionalPrescriptions }) =>
          regionalPrescriptions.some(
            (regionalPrescription) =>
              (regionalPrescription.realizedSampleCount as number) <
              regionalPrescription.sampleCount
          ) &&
          regionalPrescriptions.some(
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
        ({ regionalPrescriptions }) =>
          regionalPrescriptions.every(
            (regionalPrescription) =>
              (regionalPrescription.inProgressSampleCount as number) === 0 &&
              (regionalPrescription.realizedSampleCount as number) === 0
          ) &&
          regionalPrescriptions.some(
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
        tabs={ProgrammingPlanContextList.map((context) => ({
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
                  {sumBy(regionalPrescriptions, 'sampleCount')}{' '}
                  {pluralize(sumBy(regionalPrescriptions, 'sampleCount'))(
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
                      regionalPrescriptions ?? [],
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
                      ({ prescription, regionalPrescriptions }) => (
                        <DashboardPrescriptionCard
                          key={prescription.id}
                          programmingPlan={programmingPlan}
                          prescription={prescription}
                          regionalPrescriptions={regionalPrescriptions}
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
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescriptions: RegionalPrescription[];
}> = ({ programmingPlan, prescription, regionalPrescriptions }) => {
  return (
    <Card
      className={clsx(
        'dashboard-prescription-card',
        cx('fr-col-12', 'fr-col-sm-3')
      )}
      linkProps={{
        to: `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?programmingPlanId=${programmingPlan.id}&matrixKind=${prescription.matrixKind}`
      }}
      background
      border
      enlargeLink
      title={MatrixKindLabels[prescription.matrixKind]}
      size="small"
      end={
        <>
          <CircleProgress
            progress={getCompletionRate(regionalPrescriptions)}
            sizePx={80}
            type="total"
            total={sumBy(regionalPrescriptions, 'sampleCount')}
            values={[
              sumBy(regionalPrescriptions, 'realizedSampleCount'),
              sumBy(regionalPrescriptions, 'inProgressSampleCount')
            ]}
          />
          <div className={cx('fr-pl-2w')}>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'realized')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {sumBy(regionalPrescriptions, 'realizedSampleCount')}{' '}
                {pluralize(sumBy(regionalPrescriptions, 'realizedSampleCount'))(
                  'réalisé'
                )}
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'in-progress')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {sumBy(regionalPrescriptions, 'inProgressSampleCount')} en cours
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'remaining')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {Math.max(
                  0,
                  sumBy(regionalPrescriptions, 'sampleCount') -
                    sumBy(regionalPrescriptions, 'realizedSampleCount') -
                    sumBy(regionalPrescriptions, 'inProgressSampleCount')
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
