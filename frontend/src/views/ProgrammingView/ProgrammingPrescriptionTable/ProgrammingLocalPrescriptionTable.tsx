import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import {
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useMemo } from 'react';
import CompletionBadge from 'src/components/CompletionBadge/CompletionBadge';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { useAppDispatch } from 'src/hooks/useStore';
import LocalPrescriptionButtons from '../../../components/LocalPrescription/LocalPrescriptionButtons/LocalPrescriptionButtons';
import LocalPrescriptionDistributionBadge from '../../../components/LocalPrescription/LocalPrescriptionDistributionBadge/LocalPrescriptionDistributionBadge';
import PrescriptionBreadcrumb from '../../../components/Prescription/PrescriptionBreadcrumb/PrescriptionBreadcrumb';
import { useAuthentication } from '../../../hooks/useAuthentication';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  localPrescriptions: LocalPrescription[];
  subLocalPrescriptions: LocalPrescription[];
  region: Region;
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
  selectedPrescriptions: Prescription[];
  onTogglePrescriptionSelection?: (prescription: Prescription) => void;
}

const ProgrammingLocalPrescriptionTable = ({
  programmingPlan,
  prescriptions,
  localPrescriptions,
  subLocalPrescriptions,
  region,
  onChangeLocalPrescriptionCount,
  selectedPrescriptions,
  onTogglePrescriptionSelection
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserLocalPrescriptionPermission, hasRegionalView } =
    useAuthentication();

  const getLocalPrescription = useCallback(
    (prescriptionId: string) =>
      localPrescriptions.find(
        (r) => r.prescriptionId === prescriptionId && r.region === region
      ),
    [localPrescriptions, region]
  );

  const getSubLocalPrescriptions = useCallback(
    (prescriptionId: string) =>
      subLocalPrescriptions
        .filter((r) => r.prescriptionId === prescriptionId)
        .sort(LocalPrescriptionSort),
    [subLocalPrescriptions]
  );

  const departmentList = useMemo(
    () =>
      hasRegionalView && programmingPlan.distributionKind !== 'REGIONAL'
        ? Regions[region].departments
        : [],
    [region, programmingPlan.distributionKind, hasRegionalView]
  );

  const headers = useMemo(
    () =>
      [
        onTogglePrescriptionSelection ? <div key={'select'}></div> : undefined,
        <div
          key={'matrice'}
          className={clsx({ 'border-left': onTogglePrescriptionSelection })}
        >
          Matrice
        </div>,
        <div key={'total'} className="border-left">
          Objectif
        </div>,
        ...departmentList.map((department) => (
          <div className="border-left" key={`header-${department}`}>
            <TableHeaderCell
              name={DepartmentLabels[department]}
              shortName={department}
            />
          </div>
        )),
        <div key={'actions'} className={clsx('border-left', 'align-right')}>
          Actions
        </div>
      ].filter(isDefined),
    [departmentList, onTogglePrescriptionSelection]
  );

  const prescriptionsData = useMemo(
    () =>
      prescriptions.map((prescription) =>
        [
          onTogglePrescriptionSelection ? (
            <div key={`select-${prescription.matrixKind}`}>
              <Checkbox
                options={[
                  {
                    label: '',
                    nativeInputProps: {
                      checked: selectedPrescriptions.some(
                        (p) => p.id === prescription.id
                      ),
                      onChange: () =>
                        onTogglePrescriptionSelection(prescription)
                    }
                  }
                ]}
                small
              />
            </div>
          ) : undefined,
          <div
            className={clsx(cx('fr-text--bold'), {
              'border-left': onTogglePrescriptionSelection
            })}
            data-testid={`matrix-${prescription.matrixKind}`}
            key={`matrix-${prescription.matrixKind}`}
          >
            {MatrixKindLabels[prescription.matrixKind]}
            <PrescriptionBreadcrumb
              prescription={prescription}
              programmingPlan={programmingPlan}
            />
          </div>,
          <div
            className={clsx(cx('fr-text--bold'), 'border-left', 'sample-count')}
            key={`total-${prescription.matrixKind}`}
          >
            <div>
              {pluralize(
                getLocalPrescription(prescription.id)?.sampleCount ?? 0,
                {
                  preserveCount: true
                }
              )('prélèvement programmé')}
            </div>
            <LocalPrescriptionDistributionBadge
              localPrescription={getLocalPrescription(prescription.id)}
              subLocalPrescriptions={getSubLocalPrescriptions(prescription.id)}
            />
            {programmingPlan.regionalStatus.some(
              (_) => _.status === 'Validated'
            ) && (
              <>
                <div>
                  {pluralize(
                    getLocalPrescription(prescription.id)
                      ?.realizedSampleCount ?? 0,
                    {
                      preserveCount: true
                    }
                  )('réalisé')}
                </div>
                <div>
                  <CompletionBadge localPrescriptions={localPrescriptions} />
                </div>
              </>
            )}
          </div>,
          ...(hasRegionalView && programmingPlan.distributionKind !== 'REGIONAL'
            ? getSubLocalPrescriptions(prescription.id).map(
                (localPrescription) => (
                  <div
                    className="border-left"
                    data-testid={`cell-${prescription.matrixKind}`}
                    key={`cell-${prescription.matrixKind}-${localPrescription.region}`}
                  >
                    <DistributionCountCell
                      programmingPlan={programmingPlan}
                      matrixKind={prescription.matrixKind}
                      localPrescription={localPrescription}
                      isEditable={
                        hasUserLocalPrescriptionPermission(
                          programmingPlan,
                          localPrescription
                        )?.distributeToDepartments
                      }
                      max={
                        (getLocalPrescription(prescription.id)?.sampleCount ??
                          0) -
                        sumBy(
                          getSubLocalPrescriptions(prescription.id),
                          'sampleCount'
                        ) +
                        localPrescription.sampleCount
                      }
                      onChange={async (value) =>
                        onChangeLocalPrescriptionCount(
                          {
                            prescriptionId: localPrescription.prescriptionId,
                            region: localPrescription.region,
                            department: localPrescription.department
                          },
                          value
                        )
                      }
                    />
                  </div>
                )
              )
            : []),
          <div
            className={clsx('border-left', 'align-right')}
            key={`actions-${prescription.matrixKind}`}
          >
            <Button
              priority="tertiary"
              size="small"
              onClick={() =>
                dispatch(
                  prescriptionsSlice.actions.setPrescriptionModalData({
                    mode: 'details',
                    programmingPlan,
                    prescription
                  })
                )
              }
            >
              Instructions
            </Button>
            <LocalPrescriptionButtons
              programmingPlan={programmingPlan}
              prescription={prescription}
              localPrescription={
                getLocalPrescription(prescription.id) as LocalPrescription
              }
              subLocalPrescriptions={getSubLocalPrescriptions(prescription.id)}
              alignment="right"
              noIcon
              className={clsx(cx('fr-mt-1w'), 'link-underline')}
            />
          </div>
        ].filter(isDefined)
      ), // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      programmingPlan,
      prescriptions,
      subLocalPrescriptions,
      selectedPrescriptions,
      onTogglePrescriptionSelection
    ]
  );

  const totalData = useMemo(
    () => [
      onTogglePrescriptionSelection ? (
        <div key="select-total" className={cx('fr-checkbox-group')}></div>
      ) : undefined,
      <div
        key="matrix-total"
        className={clsx(cx('fr-text--bold'), {
          'border-left': onTogglePrescriptionSelection
        })}
      >
        Total
      </div>,
      <div className="border-left fr-text--bold" key="total-total">
        <div>{sumBy(localPrescriptions, 'sampleCount')}</div>

        {programmingPlan.regionalStatus.some(
          (_) => _.status === 'Validated'
        ) && (
          <>
            <div>{sumBy(localPrescriptions, 'realizedSampleCount')}</div>
            <CompletionBadge localPrescriptions={localPrescriptions} />
          </>
        )}
      </div>,
      ...departmentList.map((department) => [
        <div key={`total-${department}`} className="border-left fr-text--bold">
          <div>
            {sumBy(
              subLocalPrescriptions.filter((r) => r.department === department),
              'sampleCount'
            )}
          </div>
          {programmingPlan.regionalStatus.some(
            (_) => _.region === department && _.status === 'Validated'
          ) && (
            <>
              <div>
                {sumBy(
                  subLocalPrescriptions.filter((r) => r.region === department),
                  'realizedSampleCount'
                )}
              </div>
              <CompletionBadge
                localPrescriptions={subLocalPrescriptions}
                region={region}
              />
            </>
          )}
        </div>
      ]),
      <div key="actions-total" className={clsx('border-left')}></div>
    ],
    [subLocalPrescriptions, prescriptions, programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!prescriptions) {
    return <></>;
  }

  return (
    <div data-testid="prescription-table">
      <Table
        bordered
        noCaption
        headers={headers}
        data={[...prescriptionsData, totalData]}
        className="full-width"
      />
    </div>
  );
};

export default ProgrammingLocalPrescriptionTable;
