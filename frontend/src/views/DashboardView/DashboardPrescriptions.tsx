import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import clsx from 'clsx';
import { isNil, sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
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
import { FunctionComponent, useContext, useMemo, useState } from 'react';
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
  const { user } = useAuthentication();

  const [context, setContext] = useState(programmingPlan.contexts[0]);
  const [region, _setRegion] = useState(user?.region);

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      context,
      region: user?.region ?? undefined
    }),
    [programmingPlan.id, context, user?.region]
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
          regionalPrescription: (regionalPrescriptions ?? []).find(
            (regionalPrescription) =>
              regionalPrescription.prescriptionId === prescription.id
          )
        }))
        .filter(({ regionalPrescription }) => !isNil(regionalPrescription)),
    [prescriptions, regionalPrescriptions]
  );

  const realizedPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(
        ({ regionalPrescription }) =>
          ((regionalPrescription as RegionalPrescription)
            .realizedSampleCount as number) >=
          ((regionalPrescription as RegionalPrescription).sampleCount as number)
      ).length,
    [sortedPrescriptions]
  );

  const inProgressPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(
        ({ regionalPrescription }) =>
          ((regionalPrescription as RegionalPrescription)
            .realizedSampleCount as number) <
            ((regionalPrescription as RegionalPrescription)
              .sampleCount as number) &&
          ((regionalPrescription as RegionalPrescription)
            .inProgressSampleCount as number) > 0
      ).length,
    [sortedPrescriptions]
  );

  const remainingPrescriptionsCount = useMemo(
    () =>
      sortedPrescriptions.filter(
        ({ regionalPrescription }) =>
          ((regionalPrescription as RegionalPrescription)
            .realizedSampleCount as number) <
            ((regionalPrescription as RegionalPrescription)
              .sampleCount as number) &&
          ((regionalPrescription as RegionalPrescription)
            .inProgressSampleCount as number) === 0
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
                      region,
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
                  <h5>Détails des prélèvements par matrice</h5>
                  <div className={cx('fr-grid-row')}>
                    {sortedPrescriptions.map(
                      ({ prescription, regionalPrescription }) => (
                        <DashboardPrescriptionCard
                          key={prescription.id}
                          programmingPlan={programmingPlan}
                          prescription={prescription}
                          regionalPrescription={
                            regionalPrescription as RegionalPrescription
                          }
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
  regionalPrescription: RegionalPrescription;
}> = ({ programmingPlan, prescription, regionalPrescription }) => {
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
            progress={getCompletionRate(regionalPrescription)}
            sizePx={80}
            type="total"
            total={regionalPrescription.sampleCount}
            values={[
              regionalPrescription.realizedSampleCount as number,
              regionalPrescription.inProgressSampleCount as number
            ]}
          />
          <div className={cx('fr-pl-2w')}>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'realized')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {regionalPrescription.realizedSampleCount}{' '}
                {pluralize(regionalPrescription.realizedSampleCount ?? 0)(
                  'réalisé'
                )}
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'in-progress')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {regionalPrescription.inProgressSampleCount} en cours
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'remaining')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {Math.max(
                  0,
                  regionalPrescription.sampleCount -
                    (regionalPrescription.realizedSampleCount ?? 0) -
                    (regionalPrescription.inProgressSampleCount ?? 0)
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
