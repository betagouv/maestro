import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isEmpty, isNil, mapValues, omitBy, sumBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import type { Region } from 'maestro-shared/referential/Region';
import type { Company } from 'maestro-shared/schema/Company/Company';
import {
  filteredLocalPrescriptions,
  type LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  type Prescription,
  PrescriptionSort,
  type PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionCard from 'src/components/Prescription/PrescriptionCard/PrescriptionCard';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { usePrescriptionFilters } from 'src/hooks/usePrescriptionFilters';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionListHeader from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListHeader';
import { assert, type Equals } from 'tsafe';
import LocalPrescriptionCard from '../../../components/LocalPrescription/LocalPrescriptionCard/LocalPrescriptionCard';
import LocalPrescriptionModal from '../../../components/LocalPrescription/LocalPrescriptionModal/LocalPrescriptionModal';
import PrescriptionModal from '../../../components/Prescription/PrescriptionModal/PrescriptionModal';
import { ApiClientContext } from '../../../services/apiClient';
import { getApiUrl } from '../../../utils/fetchUtils';
import ProgrammingPrescriptionFilters from '../ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
import ProgrammingLocalPrescriptionTable from '../ProgrammingPrescriptionTable/ProgrammingLocalPrescriptionTable';
import ProgrammingPrescriptionTable from '../ProgrammingPrescriptionTable/ProgrammingPrescriptionTable';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  region?: Region;
  department?: Department;
  companies?: Company[];
}

const ProgrammingPrescriptionList = ({
  programmingPlans,
  region,
  department,
  companies,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { prescriptionListDisplay, prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    hasNationalView,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission,
    user
  } = useAuthentication();

  const [selectedPrescriptions, setSelectedPrescriptions] = useState<
    Prescription[]
  >([]);

  const [_, { isSuccess: isAddSuccess }] =
    apiClient.useAddPrescriptionMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    apiClient.useUpdatePrescriptionMutation();
  const [updateLocalPrescription, { isSuccess: isUpdateRegionalSuccess }] =
    apiClient.useUpdateLocalPrescriptionMutation();
  const [updateDepartmentalLocalPrescription] =
    apiClient.useUpdateDepartmentalLocalPrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeletePrescriptionMutation();

  const { programmingPlanOptions, programmingSubPlanOptions, reduceFilters } =
    usePrescriptionFilters(programmingPlans);

  const changeFilter = useCallback(
    (findFilter: Partial<typeof prescriptionFilters>) => {
      const filteredParams = reduceFilters(prescriptionFilters, findFilter);
      const urlSearchParams = new URLSearchParams(
        omitBy(
          mapValues(filteredParams, (value) => value?.toString()),
          isEmpty
        ) as Record<string, string>
      );
      setSearchParams(urlSearchParams, { replace: true });
    },
    [reduceFilters, prescriptionFilters, setSearchParams]
  );

  const planIds = useMemo(
    () => programmingPlans.map((p) => p.id),
    [programmingPlans]
  );

  const getPrescriptionPlan = useCallback(
    (prescription: Prescription): ProgrammingPlanChecked =>
      programmingPlans.find(
        (p) => p.id === prescription.programmingPlanId
      ) as ProgrammingPlanChecked,
    [programmingPlans]
  );

  const getPlanForPrescriptionId = useCallback(
    (prescriptionId: string): ProgrammingPlanChecked => {
      const plan = programmingPlans.find(
        (p) =>
          p.id ===
          allPrescriptions?.find((r) => r.id === prescriptionId)
            ?.programmingPlanId
      );
      return plan ?? programmingPlans[0];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programmingPlans]
  );

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId:
        programmingPlans.length === 1 ? programmingPlans[0].id : undefined,
      year:
        programmingPlans.length !== 1 ? prescriptionFilters.year : undefined,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      contexts: prescriptionFilters.contexts,
      region,
      includes: ['substanceCount' as const]
    }),
    [programmingPlans, prescriptionFilters, region]
  );

  const exportPrescriptionOptions = useMemo(
    () => ({
      ...findPrescriptionOptions,
      programmingPlanId: programmingPlans[0].id
    }),
    [findPrescriptionOptions, programmingPlans]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
  );

  const findLocalPrescriptionOptions = useMemo(
    () => ({
      programmingPlanIds: planIds,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      contexts: prescriptionFilters.contexts,
      region,
      department,
      includes: [
        'sampleCounts' as const,
        ...(hasUserPermission('commentPrescription')
          ? ['comments' as const]
          : []),
        ...(hasUserPermission('updatePrescriptionLaboratories')
          ? ['laboratories' as const]
          : [])
      ]
    }),
    [planIds, prescriptionFilters, region, department, hasUserPermission]
  );

  const { data: allLocalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
      skip: !findLocalPrescriptionOptions.programmingPlanIds?.length
    });

  const prescriptions = useMemo(() => {
    return allPrescriptions
      ?.filter((p) => planIds.includes(p.programmingPlanId))
      .filter((p) =>
        prescriptionFilters.matrixQuery
          ? MatrixKindLabels[p.matrixKind]
              .toLowerCase()
              .includes(prescriptionFilters.matrixQuery.toLowerCase())
          : true
      )
      .filter((p) =>
        prescriptionFilters.missingSlaughterhouse
          ? (allLocalPrescriptions?.find(
              (_) => _.prescriptionId === p.id && isNil(_.companySiret)
            )?.sampleCount ?? 0) >
            sumBy(
              allLocalPrescriptions?.filter(
                (_) => _.prescriptionId === p.id && !isNil(_.companySiret)
              ),
              'sampleCount'
            )
          : true
      )
      .filter((p) =>
        prescriptionFilters.missingLaboratory
          ? (allLocalPrescriptions ?? []).some(
              (_) =>
                _.prescriptionId === p.id &&
                isNil(_.companySiret) &&
                ((_.substanceKindsLaboratories ?? []).length === 0 ||
                  _.substanceKindsLaboratories?.some(
                    (substanceKindsLaboratory) =>
                      isNil(substanceKindsLaboratory.laboratoryId)
                  ))
            )
          : true
      )
      .filter(
        (p) =>
          hasNationalView ||
          allLocalPrescriptions?.some(
            (_) => _.prescriptionId === p.id && _.sampleCount > 0
          )
      )
      .sort(PrescriptionSort);
  }, [
    allPrescriptions,
    planIds,
    prescriptionFilters,
    allLocalPrescriptions,
    hasNationalView
  ]);

  const localPrescriptions = useMemo(
    () =>
      filteredLocalPrescriptions(allLocalPrescriptions ?? [], {
        region,
        department,
        companies
      }),
    [allLocalPrescriptions, department, region, companies]
  );

  const subLocalPrescriptions = useMemo(
    () =>
      allLocalPrescriptions
        ?.filter((_) => prescriptions?.some((p) => p.id === _.prescriptionId))
        .filter((_) => {
          if (department) {
            return (
              _.region === region &&
              _.department === department &&
              !isNil(_.companySiret)
            );
          }
          return _.region === region && !isNil(_.department);
        }),
    [prescriptions, allLocalPrescriptions, department, region]
  );

  useEffect(() => {
    if (
      searchParams.get('prescriptionId') &&
      searchParams.get('commentsRegion')
    ) {
      const prescription = (prescriptions ?? []).find(
        (prescription) => prescription.id === searchParams.get('prescriptionId')
      );
      const regionalPrescription = localPrescriptions?.find(
        (regionalPrescription) =>
          regionalPrescription.prescriptionId ===
            searchParams.get('prescriptionId') &&
          regionalPrescription.region === searchParams.get('commentsRegion')
      );
      if (prescription && regionalPrescription) {
        dispatch(
          prescriptionsSlice.actions.setPrescriptionCommentsData({
            viewBy: 'Prescription',
            programmingPlan: getPrescriptionPlan(prescription),
            prescription,
            regionalCommentsList: [regionalPrescription].map((rcp) => ({
              region: rcp.region,
              department: rcp.department,
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
  }, [searchParams, localPrescriptions]);

  const removePrescription = useCallback(async (prescriptionId: string) => {
    await deletePrescription({ prescriptionId });
  }, []);

  const changePrescription = useCallback(
    async (
      prescription: Prescription,
      prescriptionUpdate: Omit<PrescriptionUpdate, 'programmingPlanId'>
    ) => {
      const plan = getPrescriptionPlan(prescription);
      if (hasUserPrescriptionPermission(plan)?.update) {
        await updatePrescription({
          prescriptionId: prescription.id,
          programmingPlanId: plan.id,
          ...prescriptionUpdate
        });
      }
    },
    [getPrescriptionPlan, hasUserPrescriptionPermission, updatePrescription]
  );

  const changeLocalPrescription = useCallback(
    async (
      key: LocalPrescriptionKey,
      prescriptionUpdate: LocalPrescriptionUpdate
    ) => {
      if (key.department) {
        await updateDepartmentalLocalPrescription({
          prescriptionId: key.prescriptionId,
          region: key.region,
          department: key.department,
          ...prescriptionUpdate
        });
      } else {
        await updateLocalPrescription({
          prescriptionId: key.prescriptionId,
          region: key.region,
          ...prescriptionUpdate
        });
      }
    },
    [updateLocalPrescription, updateDepartmentalLocalPrescription]
  );

  const changeLocalPrescriptionCount = useCallback(
    async (key: LocalPrescriptionKey, count: number) =>
      changeLocalPrescription(key, {
        key: 'sampleCount',
        sampleCount: count,
        programmingPlanId: getPlanForPrescriptionId(key.prescriptionId).id
      }),
    [changeLocalPrescription, getPlanForPrescriptionId]
  );

  const changeSubstanceKindsLaboratories = async (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => {
    await Promise.all(
      selectedPrescriptions.map((prescription) =>
        updateDepartmentalLocalPrescription({
          prescriptionId: prescription.id,
          region: region as Region,
          department: department as Department,
          key: 'laboratories',
          substanceKindsLaboratories,
          programmingPlanId: getPrescriptionPlan(prescription).id
        })
      )
    );
  };

  const hasGroupedUpdatePermission = useMemo(
    () =>
      localPrescriptions?.some((regionalPrescription) => {
        const prescription = allPrescriptions?.find(
          (p) => p.id === regionalPrescription.prescriptionId
        );
        const plan = prescription
          ? getPrescriptionPlan(prescription)
          : programmingPlans[0];
        return hasUserLocalPrescriptionPermission(plan, regionalPrescription)
          ?.updateLaboratories;
      }),
    [
      programmingPlans,
      localPrescriptions,
      allPrescriptions,
      getPrescriptionPlan,
      hasUserLocalPrescriptionPermission
    ]
  );

  const headerPlan = programmingPlans[0];

  return (
    <>
      <AppToast open={isAddSuccess} description="Matrice ajoutée" />
      <AppToast
        open={isUpdateSuccess || isUpdateRegionalSuccess}
        description="Modification enregistrée"
      />
      <AppToast open={isDeleteSuccess} description="Matrice supprimée" />

      {prescriptions && localPrescriptions && (
        <>
          {
            <ProgrammingPrescriptionListHeader
              programmingPlan={headerPlan}
              prescriptions={prescriptions}
              localPrescriptions={localPrescriptions}
              subLocalPrescriptions={subLocalPrescriptions ?? []}
              exportURL={getApiUrl(
                '/prescriptions/export',
                exportPrescriptionOptions
              )}
              hasGroupedUpdatePermission={hasGroupedUpdatePermission}
              selectedCount={selectedPrescriptions.length}
              onGroupedUpdate={changeSubstanceKindsLaboratories}
              onSelectAll={() => {
                setSelectedPrescriptions(
                  selectedPrescriptions.length === prescriptions.length
                    ? []
                    : prescriptions
                );
              }}
            />
          }
          <ProgrammingPrescriptionFilters
            options={{
              plans: programmingPlanOptions(prescriptionFilters),
              programmingSubPlanIds:
                programmingSubPlanOptions(prescriptionFilters)
            }}
            filters={prescriptionFilters}
            onChange={changeFilter}
            renderMode="inline"
          />
          {prescriptions.length === 0 && (
            <div
              className={clsx(
                cx('fr-container', 'fr-mt-8w', {
                  'fr-px-0': prescriptionListDisplay === 'cards',
                  'fr-px-7w': prescriptionListDisplay === 'table'
                }),
                'align-center'
              )}
            >
              Aucun prélèvement programmé pour les filtres sélectionnés
            </div>
          )}
          {prescriptionListDisplay === 'cards' &&
            prescriptions.length > 0 &&
            (hasNationalView ? (
              <div className="prescription-cards-container">
                {prescriptions?.map((prescription) => (
                  <PrescriptionCard
                    key={`prescription_cards_${prescription.id}`}
                    programmingPlan={getPrescriptionPlan(prescription)}
                    prescription={prescription}
                    regionalPrescriptions={localPrescriptions.filter(
                      (rp) => rp.prescriptionId === prescription.id
                    )}
                    onChangeLocalPrescriptionCount={(region, value) =>
                      changeLocalPrescriptionCount(
                        {
                          prescriptionId: prescription.id,
                          region: region as Region
                        },
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
                {prescriptions?.flatMap((prescription) =>
                  localPrescriptions
                    .filter(
                      (regionalPrescription) =>
                        regionalPrescription.prescriptionId === prescription.id
                    )
                    .map((localPrescription) => (
                      <LocalPrescriptionCard
                        key={`prescription_cards_${prescription.id}`}
                        programmingPlan={getPrescriptionPlan(prescription)}
                        prescription={prescription}
                        localPrescription={localPrescription}
                        subLocalPrescriptions={subLocalPrescriptions?.filter(
                          (departmentalPrescription) =>
                            departmentalPrescription.prescriptionId ===
                            prescription.id
                        )}
                        isSelected={selectedPrescriptions.some(
                          (_) => _.id === prescription.id
                        )}
                        onToggleSelection={
                          hasGroupedUpdatePermission
                            ? () =>
                                setSelectedPrescriptions((prevState) =>
                                  prevState.some(
                                    (_) => _.id === prescription.id
                                  )
                                    ? prevState.filter(
                                        (_) => _.id !== prescription.id
                                      )
                                    : [...prevState, prescription]
                                )
                            : undefined
                        }
                        companies={companies}
                      />
                    ))
                )}
              </div>
            ))}
          {prescriptionListDisplay === 'table' &&
            prescriptions.length > 0 &&
            (hasNationalView ? (
              <ProgrammingPrescriptionTable
                programmingPlans={programmingPlans}
                prescriptions={prescriptions}
                regionalPrescriptions={localPrescriptions}
                onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                onChangePrescriptionSampleCount={(prescription, sampleCount) =>
                  changePrescription(prescription, { sampleCount })
                }
              />
            ) : (
              <ProgrammingLocalPrescriptionTable
                programmingPlans={programmingPlans}
                prescriptions={prescriptions}
                region={user?.region as Region}
                localPrescriptions={localPrescriptions}
                subLocalPrescriptions={subLocalPrescriptions ?? []}
                onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                selectedPrescriptions={selectedPrescriptions}
                onTogglePrescriptionSelection={
                  hasGroupedUpdatePermission
                    ? (prescription) => {
                        setSelectedPrescriptions((prevState) =>
                          prevState.some((_) => _.id === prescription.id)
                            ? prevState.filter((_) => _.id !== prescription.id)
                            : [...prevState, prescription]
                        );
                      }
                    : undefined
                }
                companies={companies}
              />
            ))}
        </>
      )}
      <PrescriptionModal
        onUpdatePrescriptionSubstances={(prescription, substances) =>
          changePrescription(prescription, {
            substances
          })
        }
      />
      <LocalPrescriptionModal />
    </>
  );
};

export default ProgrammingPrescriptionList;
