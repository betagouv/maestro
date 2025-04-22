import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { Stage } from 'maestro-shared/referential/Stage';
import {
  PrescriptionSort,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescriptionUpdate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionCard from 'src/components/Prescription/PrescriptionCard/PrescriptionCard';
import PrescriptionSubstancesModal from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesModal';
import RegionalPrescriptionCard from 'src/components/Prescription/RegionalPrescriptionCard/RegionalPrescriptionCard';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import {
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation
} from 'src/services/prescription.service';
import {
  useFindRegionalPrescriptionsQuery,
  useUpdateRegionalPrescriptionMutation
} from 'src/services/regionalPrescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPlanPrescriptionListHeader from 'src/views/ProgrammingPlanView/ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionListHeader';
import ProgrammingPlanPrescriptionTable from 'src/views/ProgrammingPlanView/ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionTable';
import { assert, type Equals } from 'tsafe';

export type PrescriptionListDisplay = 'table' | 'cards';

interface Props {
  programmingPlan: ProgrammingPlan;
  context: Context;
  region?: Region;
}

const ProgrammingPlanPrescriptionList = ({
  programmingPlan,
  region,
  context,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const dispatch = useAppDispatch();
  const { prescriptionListDisplay, matrixQuery } = useAppSelector(
    (state) => state.prescriptions
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    hasNationalView,
    hasUserPrescriptionPermission,
    hasUserRegionalPrescriptionPermission
  } = useAuthentication();

  const [selectedRegionalPrescriptionIds, setSelectedRegionalPrescriptionIds] =
    useState<string[]>([]);

  const [addPrescription, { isSuccess: isAddSuccess }] =
    useAddPrescriptionMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [updateRegionalPrescription, { isSuccess: isUpdateRegionalSuccess }] =
    useUpdateRegionalPrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionMutation();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      context,
      region,
      includes: ['substanceCount' as const]
    }),
    [programmingPlan, context, region]
  );

  const { data: allPrescriptions } = useFindPrescriptionsQuery(
    findPrescriptionOptions
  );

  const prescriptions = useMemo(() => {
    return allPrescriptions
      ?.filter((p) =>
        matrixQuery
          ? MatrixKindLabels[p.matrixKind]
              .toLowerCase()
              .includes(matrixQuery.toLowerCase())
          : true
      )
      .sort(PrescriptionSort);
  }, [allPrescriptions, matrixQuery]);

  const { data: regionalPrescriptions } = useFindRegionalPrescriptionsQuery({
    ...findPrescriptionOptions,
    includes: ['comments', 'realizedSampleCount']
  });

  useEffect(() => {
    if (
      searchParams.get('prescriptionId') &&
      searchParams.get('commentsRegion')
    ) {
      const prescription = (prescriptions ?? []).find(
        (prescription) => prescription.id === searchParams.get('prescriptionId')
      );
      const regionalPrescription = regionalPrescriptions?.find(
        (regionalPrescription) =>
          regionalPrescription.prescriptionId ===
            searchParams.get('prescriptionId') &&
          regionalPrescription.region === searchParams.get('commentsRegion')
      );
      if (prescription && regionalPrescription) {
        dispatch(
          prescriptionsSlice.actions.setPrescriptionCommentsData({
            matrixKind: prescription.matrixKind,
            regionalPrescriptions: [regionalPrescription]
          })
        );
      }
      setTimeout(() => {
        searchParams.delete('prescriptionId');
        searchParams.delete('commentsRegion');
        setSearchParams(searchParams, { replace: true });
      }, 1000);
    }
  }, [searchParams, regionalPrescriptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMatrix = useCallback(
    async (programmingPlanId: string, matrixKind: MatrixKind) => {
      await addPrescription({
        programmingPlanId,
        context,
        matrixKind,
        stages: []
      });
    },
    [context] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removePrescription = useCallback(
    async (prescriptionId: string) => {
      await deletePrescription(prescriptionId);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changePrescription = useCallback(
    async (
      prescriptionId: string,
      prescriptionUpdate: Omit<PrescriptionUpdate, 'programmingPlanId'>
    ) => {
      if (hasUserPrescriptionPermission(programmingPlan)?.update) {
        await updatePrescription({
          prescriptionId,
          prescriptionUpdate: {
            programmingPlanId: programmingPlan.id,
            ...prescriptionUpdate
          }
        });
      }
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePrescriptionSubstances = useCallback(
    async (
      prescriptionId: string,
      prescriptionSubstances: PrescriptionSubstance[]
    ) =>
      changePrescription(prescriptionId, {
        substances: prescriptionSubstances
      }),
    [changePrescription] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePrescriptionStages = useCallback(
    async (prescriptionId: string, stages: Stage[]) =>
      changePrescription(prescriptionId, {
        stages
      }),
    [changePrescription] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const updatePrescriptionNotes = useCallback(
    async (prescriptionId: string, notes: string) =>
      changePrescription(prescriptionId, {
        notes
      }),
    [changePrescription] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeRegionalPrescription = useCallback(
    async (
      prescriptionId: string,
      region: Region,
      prescriptionUpdate: Omit<RegionalPrescriptionUpdate, 'programmingPlanId'>
    ) => {
      await updateRegionalPrescription({
        prescriptionId,
        region,
        prescriptionUpdate: {
          programmingPlanId: programmingPlan.id,
          ...prescriptionUpdate
        }
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeRegionalPrescriptionCount = useCallback(
    async (prescriptionId: string, region: Region, count: number) =>
      changeRegionalPrescription(prescriptionId, region, {
        sampleCount: count
      }),
    [changeRegionalPrescription] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeRegionalPrescriptionsLaboratory = useCallback(
    async (prescriptionIds: string[], laboratoryId?: string) => {
      await Promise.all(
        prescriptionIds.map((prescriptionId) =>
          changeRegionalPrescription(prescriptionId, region as Region, {
            laboratoryId
          })
        )
      );
      return;
    },
    [changeRegionalPrescription, region] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <AppToast open={isAddSuccess} description="Matrice ajoutée" />
      <AppToast
        open={isUpdateSuccess || isUpdateRegionalSuccess}
        description="Modification enregistrée"
      />
      <AppToast open={isDeleteSuccess} description="Matrice supprimée" />

      {prescriptions && regionalPrescriptions && (
        <>
          <div
            className={clsx(
              cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container'),
              'table-header'
            )}
          >
            {
              <ProgrammingPlanPrescriptionListHeader
                programmingPlan={programmingPlan}
                findPrescriptionOptions={findPrescriptionOptions}
                prescriptions={prescriptions}
                addMatrixKind={(matrixKind) =>
                  addMatrix(programmingPlan.id, matrixKind)
                }
                sampleCount={_.sumBy(regionalPrescriptions, 'sampleCount')}
                hasGroupedUpdatePermission={regionalPrescriptions.some(
                  (regionalPrescription) =>
                    hasUserRegionalPrescriptionPermission(
                      programmingPlan,
                      regionalPrescription
                    )?.updateLaboratory
                )}
                selectedCount={selectedRegionalPrescriptionIds.length}
                onGroupedUpdate={async (laboratoryId) => {
                  await changeRegionalPrescriptionsLaboratory(
                    selectedRegionalPrescriptionIds,
                    laboratoryId
                  );
                  setSelectedRegionalPrescriptionIds([]);
                }}
                onSelectAll={() => {
                  setSelectedRegionalPrescriptionIds(
                    selectedRegionalPrescriptionIds.length ===
                      prescriptions.length
                      ? []
                      : prescriptions.map((p) => p.id)
                  );
                }}
              />
            }
          </div>
          {prescriptionListDisplay === 'cards' && (
            <>
              {hasNationalView ? (
                <div className="prescription-cards-container">
                  {prescriptions?.map((prescription) => (
                    <PrescriptionCard
                      key={`prescription_cards_${prescription.id}`}
                      programmingPlan={programmingPlan}
                      prescription={prescription}
                      regionalPrescriptions={regionalPrescriptions.filter(
                        (rp) => rp.prescriptionId === prescription.id
                      )}
                      onChangeRegionalPrescriptionCount={
                        changeRegionalPrescriptionCount
                      }
                      onRemovePrescription={removePrescription}
                      onChangePrescriptionStages={updatePrescriptionStages}
                      onChangePrescriptionNotes={updatePrescriptionNotes}
                    />
                  ))}
                </div>
              ) : (
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  {prescriptions?.map((prescription) => (
                    <RegionalPrescriptionCard
                      key={`prescription_cards_${prescription.id}`}
                      programmingPlan={programmingPlan}
                      prescription={prescription}
                      regionalPrescription={regionalPrescriptions.find(
                        (regionalPrescription) =>
                          regionalPrescription.prescriptionId ===
                            prescription.id &&
                          regionalPrescription.region === region
                      )}
                      onChangeLaboratory={(laboratoryId) =>
                        changeRegionalPrescriptionsLaboratory(
                          [prescription.id],
                          laboratoryId
                        )
                      }
                      isSelected={selectedRegionalPrescriptionIds.includes(
                        prescription.id
                      )}
                      onToggleSelection={() => {
                        setSelectedRegionalPrescriptionIds((prevState) =>
                          prevState.includes(prescription.id)
                            ? prevState.filter((id) => id !== prescription.id)
                            : [...prevState, prescription.id]
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {prescriptionListDisplay === 'table' && (
            <ProgrammingPlanPrescriptionTable
              programmingPlan={programmingPlan}
              prescriptions={prescriptions}
              regionalPrescriptions={regionalPrescriptions}
              onChangeRegionalPrescriptionCount={
                changeRegionalPrescriptionCount
              }
            />
          )}
        </>
      )}
      <PrescriptionSubstancesModal
        onUpdatePrescriptionSubstances={updatePrescriptionSubstances}
      />
    </>
  );
};

export default ProgrammingPlanPrescriptionList;
