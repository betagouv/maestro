import Badge from '@codegouvfr/react-dsfr/Badge';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useCallback, useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlan;
}

const ProgrammingPlanRegionalValidationList = ({
  programmingPlan,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [regionFilter, setRegionFilter] = useState<Region>();
  const [statusFilter, setStatusFilter] = useState<ProgrammingPlanStatus>();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      contexts: prescriptionFilters.context
        ? [prescriptionFilters.context]
        : undefined
    }),
    [programmingPlan, prescriptionFilters]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
  );

  const findLocalPrescriptionOptions = useMemo(
    () => ({
      ...findPrescriptionOptions,
      includes: ['comments' as const, 'sampleCounts' as const]
    }),
    [findPrescriptionOptions]
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(
      {
        ...findPrescriptionOptions,
        includes: ['comments']
      },
      {
        skip: !FindLocalPrescriptionOptions.safeParse(
          findLocalPrescriptionOptions
        ).success
      }
    );

  const regionalCommentedPrescriptions = useCallback(
    (region: Region) => {
      if (!regionalPrescriptions || !allPrescriptions) {
        return [];
      }
      return regionalPrescriptions
        .filter(
          (regionalPrescription) =>
            regionalPrescription.region === region &&
            (regionalPrescription.comments ?? []).length > 0
        )
        .map((regionalPrescription) => ({
          ...regionalPrescription,
          ...allPrescriptions.find(
            (allPrescription) =>
              allPrescription.id === regionalPrescription.prescriptionId
          )
        }));
    },
    [allPrescriptions, regionalPrescriptions]
  );

  const validatedRegions = useMemo(
    () =>
      programmingPlan.regionalStatus.filter(
        (regionalStatus) =>
          !['InProgress', 'SubmittedToRegion'].includes(regionalStatus.status)
      ),
    [programmingPlan.regionalStatus]
  );

  const filteredRegions = useMemo(
    () =>
      RegionList.filter(
        (region) =>
          (!regionFilter || regionFilter === region) &&
          (!statusFilter ||
            programmingPlan.regionalStatus.some(
              (regionalStatus) =>
                regionalStatus.region === region &&
                regionalStatus.status === statusFilter
            ))
      ),
    [regionFilter, statusFilter, programmingPlan]
  );

  if (!allPrescriptions || !regionalPrescriptions) {
    return <></>;
  }

  return (
    <>
      <div
        className={clsx(
          cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container')
        )}
      >
        <div className={clsx('d-flex-align-center')}>
          <h4 className={clsx(cx('fr-mb-0', 'fr-mr-3w'), 'flex-grow-1')}>
            {t('region_has_validated', {
              count: validatedRegions.length
            })}
          </h4>
          <div className={cx('fr-mr-2w')}>
            <Select
              label="Région"
              nativeSelectProps={{
                value: regionFilter ?? '',
                onChange: (e) => setRegionFilter(e.target.value as Region)
              }}
            >
              <option value="">Toutes les régions</option>
              {RegionList.map((region) => (
                <option key={`select-region-${region}`} value={region}>
                  {Regions[region].name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label="Status"
              nativeSelectProps={{
                value: statusFilter ?? '',
                onChange: (e) =>
                  setStatusFilter(e.target.value as ProgrammingPlanStatus)
              }}
            >
              <option value="">Tous les status</option>
              {[
                'SubmittedToRegion',
                'ApprovedByRegion',
                'Validated',
                'Closed'
              ].map((status) => (
                <option key={`select-status-${status}`} value={status}>
                  {ProgrammingPlanStatusLabels[status as ProgrammingPlanStatus]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          {regionFilter && (
            <Tag
              dismissible
              nativeButtonProps={{
                onClick: () => setRegionFilter(undefined)
              }}
            >
              {Regions[regionFilter].name}
            </Tag>
          )}
          {statusFilter && (
            <Tag
              dismissible
              nativeButtonProps={{
                onClick: () => setStatusFilter(undefined)
              }}
            >
              {ProgrammingPlanStatusLabels[statusFilter]}
            </Tag>
          )}
        </div>
        <div
          className={clsx(
            cx('fr-grid-row', 'fr-grid-row--gutters'),
            'fr-mt-2w'
          )}
        >
          {filteredRegions.map((region) => (
            <div className={cx('fr-col-12', 'fr-col-md-6')} key={region}>
              <div
                className={clsx(cx('fr-card', 'fr-card--sm'), 'regional-card')}
              >
                <div className={cx('fr-card__body')}>
                  <div className={cx('fr-card__content')}>
                    <div className="d-flex-align-center">
                      <h3
                        className={clsx(
                          cx('fr-card__title', 'fr-mb-0'),
                          'flex-grow-1'
                        )}
                      >
                        <div className="flex-grow-1">
                          {Regions[region].name}
                        </div>
                      </h3>
                    </div>
                    <div className="fr-card__end">
                      <div>
                        {pluralize(
                          regionalPrescriptions.filter(
                            (rp) => rp.region === region
                          ).length,
                          { preserveCount: true }
                        )('matrice')}
                        {' • '}
                        {pluralize(
                          sumBy(
                            regionalPrescriptions.filter(
                              (rp) => rp.region === region
                            ),
                            'sampleCount'
                          ),
                          { preserveCount: true }
                        )('prélèvement')}
                        <Badge
                          noIcon
                          severity={
                            validatedRegions.some(
                              (validatedRegion) =>
                                validatedRegion.region === region
                            )
                              ? 'success'
                              : 'warning'
                          }
                          className={'fr-mx-1w'}
                        >
                          {validatedRegions.some(
                            (validatedRegion) =>
                              validatedRegion.region === region
                          )
                            ? 'Consultation terminée'
                            : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <ButtonsGroup
                  buttonsEquisized
                  buttonsSize="small"
                  alignment="center"
                  inlineLayoutWhen="always"
                  className={cx('fr-m-0')}
                  buttons={[
                    {
                      children: (
                        <span className="no-wrap">
                          {t('comment', {
                            count: sumBy(
                              regionalCommentedPrescriptions(region),
                              (rcp) => (rcp.comments ?? []).length
                            )
                          })}
                        </span>
                      ),
                      disabled:
                        sumBy(
                          regionalCommentedPrescriptions(region),
                          (rcp) => (rcp.comments ?? []).length
                        ) === 0,
                      priority: 'tertiary no outline',
                      onClick: () =>
                        dispatch(
                          prescriptionsSlice.actions.setPrescriptionCommentsData(
                            {
                              viewBy: 'Region',
                              region,
                              matrixKindsComments:
                                regionalCommentedPrescriptions(region).map(
                                  (rcp) => ({
                                    programmingPlan,
                                    matrixKind: rcp.matrixKind as MatrixKind,
                                    comments: rcp.comments ?? []
                                  })
                                )
                            }
                          )
                        ),
                      iconId: 'fr-icon-chat-3-line',
                      className: cx('fr-m-0')
                    }
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProgrammingPlanRegionalValidationList;
