import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  type ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
}

const ProgrammingPlanRegionalValidationList = ({
  programmingPlan,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [regionFilter, setRegionFilter] = useState<Region>();
  const [statusFilter, setStatusFilter] = useState<ProgrammingPlanStatus>();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      contexts: prescriptionFilters.contexts
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
      programmingPlanIds: [programmingPlan.id],
      contexts: prescriptionFilters.contexts
    }),
    [programmingPlan, prescriptionFilters]
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
      skip: !findLocalPrescriptionOptions.programmingPlanIds?.length
    });

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
    return null;
  }

  return (
    <div
      className={clsx(cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container'))}
    >
      <div className={clsx('d-flex-align-center')}>
        <h4 className={clsx(cx('fr-mb-0', 'fr-mr-3w'), 'flex-grow-1')}>
          {t('region_has_sent', {
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
            label="Statut"
            nativeSelectProps={{
              value: statusFilter ?? '',
              onChange: (e) =>
                setStatusFilter(e.target.value as ProgrammingPlanStatus)
            }}
          >
            <option value="">Tous les statuts</option>
            {[
              'InProgress',
              'SubmittedToRegion',
              'SubmittedToDepartments',
              'Validated'
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
        className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'), 'fr-mt-2w')}
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
                      <div className="flex-grow-1">{Regions[region].name}</div>
                    </h3>
                  </div>
                  <div className="fr-card__end">
                    <div>
                      {pluralize(
                        regionalPrescriptions.filter(
                          (rp) => rp.region === region && rp.sampleCount > 0
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
                    </div>

                    <Badge
                      noIcon
                      severity={
                        validatedRegions.some(
                          (validatedRegion) => validatedRegion.region === region
                        )
                          ? 'success'
                          : 'warning'
                      }
                      className={'fr-my-1w'}
                    >
                      {
                        ProgrammingPlanStatusLabels[
                          programmingPlan.regionalStatus.find(
                            (rs) => rs.region === region
                          )?.status as ProgrammingPlanStatus
                        ]
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgrammingPlanRegionalValidationList;
