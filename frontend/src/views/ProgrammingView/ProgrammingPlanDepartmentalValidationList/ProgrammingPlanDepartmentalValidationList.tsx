import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import {
  Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlan;
  region: Region;
}

const ProgrammingPlanDepartmentalValidationList = ({
  programmingPlan,
  region,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [departmentFilter, setDepartmentFilter] = useState<Department>();
  const [statusFilter, setStatusFilter] = useState<ProgrammingPlanStatus>();

  const departmentList = useMemo(() => Regions[region].departments, [region]);

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

  const { data: departmentalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(
      {
        ...findPrescriptionOptions,
        region,
        includes: ['comments']
      },
      {
        skip: !FindLocalPrescriptionOptions.safeParse(
          findLocalPrescriptionOptions
        ).success
      }
    );

  const validatedDepartments = useMemo(
    () =>
      programmingPlan.departmentalStatus?.filter(
        (departmentalStatus) => departmentalStatus.status === 'Validated'
      ) || [],
    [programmingPlan.departmentalStatus]
  );

  const filteredDepartments = useMemo(
    () =>
      departmentList.filter(
        (department) =>
          (!departmentFilter || departmentFilter === department) &&
          (!statusFilter ||
            programmingPlan.departmentalStatus?.some(
              (departmentalStatus) =>
                departmentalStatus.department === department &&
                departmentalStatus.status === statusFilter
            ))
      ),
    [
      departmentFilter,
      statusFilter,
      programmingPlan.departmentalStatus,
      departmentList
    ]
  );

  if (!allPrescriptions || !departmentalPrescriptions) {
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
            {t('department_has_sent', {
              count: validatedDepartments.length
            })}
          </h4>
          <div className={cx('fr-mr-2w')}>
            <Select
              label="Département"
              nativeSelectProps={{
                value: departmentFilter ?? '',
                onChange: (e) => setDepartmentFilter(e.target.value as Region)
              }}
            >
              <option value="">Tous les départements</option>
              {departmentList.map((department) => (
                <option
                  key={`select-department-${department}`}
                  value={department}
                >
                  {DepartmentLabels[department]}
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
              {['SubmittedToDepartments', 'Validated'].map((status) => (
                <option key={`select-status-${status}`} value={status}>
                  {ProgrammingPlanStatusLabels[status as ProgrammingPlanStatus]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          {departmentFilter && (
            <Tag
              dismissible
              nativeButtonProps={{
                onClick: () => setDepartmentFilter(undefined)
              }}
            >
              {DepartmentLabels[departmentFilter]}
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
          {filteredDepartments.map((department) => (
            <div className={cx('fr-col-12', 'fr-col-md-6')} key={department}>
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
                          {DepartmentLabels[department]}
                        </div>
                      </h3>
                    </div>
                    <div className="fr-card__end">
                      <div>
                        {pluralize(
                          departmentalPrescriptions.filter(
                            (_) =>
                              _.department === department && _.sampleCount > 0
                          ).length,
                          { preserveCount: true }
                        )('matrice')}
                        {' • '}
                        {pluralize(
                          sumBy(
                            departmentalPrescriptions.filter(
                              (_) => _.department === department
                            ),
                            'sampleCount'
                          ),
                          { preserveCount: true }
                        )('prélèvement')}
                      </div>
                      <Badge
                        noIcon
                        severity={
                          validatedDepartments.some(
                            (validatedDepartment) =>
                              validatedDepartment.department === department
                          )
                            ? 'success'
                            : 'warning'
                        }
                        className={'fr-my-1w'}
                      >
                        {
                          ProgrammingPlanStatusLabels[
                            (programmingPlan.departmentalStatus.find(
                              (ds) => ds.department === department
                            )?.status ?? 'InProgress') as ProgrammingPlanStatus
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
    </>
  );
};

export default ProgrammingPlanDepartmentalValidationList;
