import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionSort,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionCard from 'src/components/Prescription/PrescriptionCard/PrescriptionCard';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionListHeader from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListHeader';
import { assert, type Equals } from 'tsafe';
import PrescriptionEditModal from '../../../components/Prescription/PrescriptionEditModal/PrescriptionEditModal';
import RegionalPrescriptionCard from '../../../components/Prescription/RegionalPrescriptionCard/RegionalPrescriptionCard';
import { ApiClientContext } from '../../../services/apiClient';
import ProgrammingPrescriptionTable from './ProgrammingPrescriptionTable';

export type PrescriptionListDisplay = 'table' | 'cards';

interface Props {
  programmingPlans: ProgrammingPlan[];
  region?: Region;
}

const ProgrammingPrescriptionList = ({
  programmingPlans,
  region,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { prescriptionListDisplay, matrixQuery, prescriptionFilters } =
    useAppSelector((state) => state.prescriptions);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    hasNationalView,
    hasUserPrescriptionPermission,
    hasUserRegionalPrescriptionPermission
  } = useAuthentication();

  const [selectedRegionalPrescriptionIds, setSelectedRegionalPrescriptionIds] =
    useState<string[]>([]);

  const [addPrescription, { isSuccess: isAddSuccess }] =
    apiClient.useAddPrescriptionMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    apiClient.useUpdatePrescriptionMutation();
  const [updateRegionalPrescription, { isSuccess: isUpdateRegionalSuccess }] =
    apiClient.useUpdateRegionalPrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeletePrescriptionMutation();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanIds: programmingPlans.map((pp) => pp.id),
      programmingPlanKinds: prescriptionFilters.kinds,
      contexts: prescriptionFilters.contexts,
      matrixKinds: prescriptionFilters.matrixKinds,
      region,
      includes: ['substanceCount' as const]
    }),
    [programmingPlans, prescriptionFilters, region]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
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

  const findRegionalPrescriptionOptions = useMemo(
    () => ({
      ...findPrescriptionOptions,
      includes: ['comments' as const, 'sampleCounts' as const]
    }),
    [findPrescriptionOptions]
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindRegionalPrescriptionsQuery(
      findRegionalPrescriptionOptions,
      {
        skip: !FindRegionalPrescriptionOptions.safeParse(
          findRegionalPrescriptionOptions
        ).success
      }
    );

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
            viewBy: 'MatrixKind',
            prescriptionId: regionalPrescription.prescriptionId,
            matrixKind: prescription.matrixKind,
            regionalComments: [regionalPrescription].map((rcp) => ({
              region: rcp.region,
              comments: rcp.comments ?? []
            }))
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
    async (
      programmingPlanId: string,
      programmingPlanKind: ProgrammingPlanKind,
      context: ProgrammingPlanContext,
      matrixKind: MatrixKind
    ) => {
      await addPrescription({
        programmingPlanId,
        programmingPlanKind,
        context,
        matrixKind,
        stages: []
      });
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removePrescription = useCallback(
    async (prescriptionId: string) => {
      await deletePrescription(prescriptionId);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changePrescription = useCallback(
    async (
      prescription: Prescription,
      prescriptionUpdate: Omit<PrescriptionUpdate, 'programmingPlanId'>
    ) => {
      const programmingPlan = programmingPlans.find(
        (pp) => pp.id === prescription.programmingPlanId
      );
      if (
        programmingPlan &&
        hasUserPrescriptionPermission(programmingPlan)?.update
      ) {
        await updatePrescription({
          prescriptionId: prescription.id,
          prescriptionUpdate: {
            programmingPlanId: programmingPlan.id,
            ...prescriptionUpdate
          }
        });
      }
    },
    [programmingPlans] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeRegionalPrescription = useCallback(
    async (
      prescription: Prescription,
      region: Region,
      prescriptionUpdate: Omit<RegionalPrescriptionUpdate, 'programmingPlanId'>
    ) => {
      const programmingPlan = programmingPlans.find(
        (pp) => pp.id === prescription.programmingPlanId
      );
      if (programmingPlan) {
        await updateRegionalPrescription({
          prescriptionId: prescription.id,
          region,
          prescriptionUpdate: {
            programmingPlanId: programmingPlan.id,
            ...prescriptionUpdate
          }
        });
      }
    },
    [programmingPlans] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeRegionalPrescriptionCount = useCallback(
    async (prescription: Prescription, region: Region, count: number) =>
      changeRegionalPrescription(prescription, region, {
        sampleCount: count
      }),
    [changeRegionalPrescription]
  );

  const changeRegionalPrescriptionsLaboratory = useCallback(
    async (prescriptions: Prescription[], laboratoryId?: string) => {
      await Promise.all(
        prescriptions.map((prescription) =>
          changeRegionalPrescription(prescription, region as Region, {
            laboratoryId
          })
        )
      );
      return;
    },
    [changeRegionalPrescription, region]
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
              <ProgrammingPrescriptionListHeader
                findPrescriptionOptions={findPrescriptionOptions}
                prescriptions={prescriptions}
                addMatrixKind={(matrixKind, programmingPlan) =>
                  addMatrix(
                    programmingPlan.id,
                    programmingPlan.kinds[0],
                    matrixKind
                  )
                }
                sampleCount={sumBy(regionalPrescriptions, 'sampleCount')}
                // hasGroupedUpdatePermission={regionalPrescriptions.some(
                //   (regionalPrescription) =>
                //     hasUserRegionalPrescriptionPermission(
                //       programmingPlan,
                //       regionalPrescription
                //     )?.updateLaboratory
                // )}
                selectedCount={selectedRegionalPrescriptionIds.length}
                // onGroupedUpdate={async (laboratoryId) => {
                //   await changeRegionalPrescriptionsLaboratory(
                //     selectedRegionalPrescriptionIds,
                //     laboratoryId
                //   );
                //   setSelectedRegionalPrescriptionIds([]);
                // }}
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
                      programmingPlan={programmingPlans.find(
                        (pp) => pp.id === prescription.programmingPlanId
                      )}
                      prescription={prescription}
                      regionalPrescriptions={regionalPrescriptions.filter(
                        (rp) => rp.prescriptionId === prescription.id
                      )}
                      onChangeRegionalPrescriptionCount={(region, value) =>
                        changeRegionalPrescriptionCount(
                          prescription,
                          region,
                          value
                        )
                      }
                      onRemovePrescription={removePrescription}
                      onChangePrescriptionStages={(stages) =>
                        changePrescription(prescription, {
                          stages
                        })
                      }
                      onChangePrescriptionNotes={(notes) =>
                        changePrescription(prescription, {
                          notes
                        })
                      }
                      onChangePrescriptionProgrammingInstruction={(
                        programmingInstruction
                      ) =>
                        changePrescription(prescription, {
                          programmingInstruction
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  {prescriptions?.map((prescription) => (
                    <RegionalPrescriptionCard
                      key={`prescription_cards_${prescription.id}`}
                      programmingPlan={programmingPlans.find(
                        (pp) => pp.id === prescription.programmingPlanId
                      )}
                      prescription={prescription}
                      regionalPrescription={regionalPrescriptions.find(
                        (regionalPrescription) =>
                          regionalPrescription.prescriptionId ===
                            prescription.id &&
                          regionalPrescription.region === region
                      )}
                      onChangeLaboratory={(laboratoryId) =>
                        changeRegionalPrescriptionsLaboratory(
                          [prescription],
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
            <ProgrammingPrescriptionTable
              programmingPlans={programmingPlans}
              prescriptions={prescriptions}
              regionalPrescriptions={regionalPrescriptions}
              onChangeRegionalPrescriptionCount={
                changeRegionalPrescriptionCount
              }
            />
          )}
        </>
      )}
      <PrescriptionEditModal
        onUpdatePrescriptionSubstances={(prescription, substances) =>
          changePrescription(prescription, {
            substances
          })
        }
      />
    </>
  );
};

export default ProgrammingPrescriptionList;
