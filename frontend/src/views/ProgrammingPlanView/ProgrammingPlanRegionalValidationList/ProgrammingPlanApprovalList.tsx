import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useCallback, useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAppDispatch } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlan;
  context: ProgrammingPlanContext;
}

const ProgrammingPlanApprovalList = ({
  programmingPlan,
  context,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);

  const [regionFilter, setRegionFilter] = useState<Region>();
  const [statusFilter, setStatusFilter] = useState<ProgrammingPlanStatus>();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan?.id as string,
      context
    }),
    [programmingPlan, context]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery({
      ...findPrescriptionOptions,
      includes: ['comments']
    });

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
          !['InProgress', 'Submitted'].includes(regionalStatus.status)
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
              {['Submitted', 'Approved', 'Validated', 'Closed'].map(
                (status) => (
                  <option key={`select-status-${status}`} value={status}>
                    {
                      ProgrammingPlanStatusLabels[
                        status as ProgrammingPlanStatus
                      ]
                    }
                  </option>
                )
              )}
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
        <div className={clsx(cx('fr-mt-2w'), 'border')}>
          {filteredRegions.map((region, regionIndex) => (
            <div key={`region-${regionIndex}`}>
              <div className={cx('fr-m-2w')}>
                <div className={clsx('d-flex-align-center')}>
                  <h6 className="flex-grow-1">
                    {validatedRegions.some(
                      (validatedRegion) => validatedRegion.region === region
                    ) ? (
                      <span
                        className={cx(
                          'fr-icon-checkbox-circle-line',
                          'fr-label--success',
                          'fr-mr-1w'
                        )}
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <span
                        className={cx(
                          'fr-icon-time-line',
                          'fr-label--error',
                          'fr-mr-1w'
                        )}
                        aria-hidden="true"
                      ></span>
                    )}

                    {Regions[region].name}
                  </h6>
                  {sumBy(
                    regionalCommentedPrescriptions(region),
                    (rcp) => (rcp.comments ?? []).length
                  ) > 0 && (
                    <Button
                      priority="secondary"
                      onClick={() => {
                        dispatch(
                          prescriptionsSlice.actions.setPrescriptionCommentsData(
                            {
                              viewBy: 'Region',
                              region,
                              matrixKindsComments:
                                regionalCommentedPrescriptions(region).map(
                                  (rcp) => ({
                                    matrixKind: rcp.matrixKind as MatrixKind,
                                    comments: rcp.comments ?? []
                                  })
                                )
                            }
                          )
                        );
                      }}
                    >
                      {sumBy(
                        regionalCommentedPrescriptions(region),
                        (rcp) => (rcp.comments ?? []).length
                      )}{' '}
                      {pluralize(
                        sumBy(
                          regionalCommentedPrescriptions(region),
                          (rcp) => (rcp.comments ?? []).length
                        )
                      )('commentaire')}
                    </Button>
                  )}
                </div>
                <div>
                  {regionalCommentedPrescriptions(region).length === 0
                    ? 'Aucun commentaire'
                    : pluralize(regionalCommentedPrescriptions(region).length)(
                        'Matrice commentée'
                      )}
                  {regionalCommentedPrescriptions(region).map((rcp) => (
                    <Button
                      className={clsx('link-underline')}
                      key={`${rcp.matrixKind}-region-${rcp.region}`}
                      priority="tertiary no outline"
                      onClick={() => {
                        dispatch(
                          prescriptionsSlice.actions.setPrescriptionCommentsData(
                            {
                              viewBy: 'Region',
                              region,
                              currentMatrixKind: rcp.matrixKind,
                              matrixKindsComments:
                                regionalCommentedPrescriptions(region).map(
                                  (rcp) => ({
                                    matrixKind: rcp.matrixKind as MatrixKind,
                                    comments: rcp.comments ?? []
                                  })
                                )
                            }
                          )
                        );
                      }}
                    >
                      {MatrixKindLabels[rcp.matrixKind as MatrixKind]}
                    </Button>
                  ))}
                </div>
              </div>
              {regionIndex !== filteredRegions.length - 1 && <hr />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProgrammingPlanApprovalList;
