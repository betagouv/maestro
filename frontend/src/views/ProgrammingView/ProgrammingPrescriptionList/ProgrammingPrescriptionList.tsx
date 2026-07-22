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
import {
  type LocalPrescriptionKey,
  type LocalPrescriptionKeyString,
  toLocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  type Prescription,
  PrescriptionSort,
  type PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isDepartmentalRole,
  isNationalRole,
  isRegionalRole
} from 'maestro-shared/schema/User/UserRole';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionActionBar from 'src/components/Prescription/PrescriptionActionBar/PrescriptionActionBar';
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
  onPendingChange?: (hasPendingChanges: boolean, reset: () => void) => void;
}

const ProgrammingPrescriptionList = ({
  programmingPlans,
  region,
  department,
  companies,
  onPendingChange,
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
    hasRegionalView,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission,
    userRole,
    user
  } = useAuthentication();

  const [selectedPrescriptions, setSelectedPrescriptions] = useState<
    Prescription[]
  >([]);

  const [pendingLocalChanges, setPendingLocalChanges] = useState<
    Map<
      LocalPrescriptionKeyString,
      { key: LocalPrescriptionKey; sampleCount: number }
    >
  >(new Map());
  const [pendingPrescriptionSampleCounts, setPendingPrescriptionSampleCounts] =
    useState<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasPendingChanges =
    pendingLocalChanges.size > 0 || pendingPrescriptionSampleCounts.size > 0;

  const [_, { isSuccess: isAddSuccess }] =
    apiClient.useAddPrescriptionMutation();
  const [updatePrescription] = apiClient.useUpdatePrescriptionMutation();
  const [updateLocalPrescription] =
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

  const allPrescriptionsWithPending = useMemo(
    () =>
      allPrescriptions?.map((p) => {
        const pending = pendingPrescriptionSampleCounts.get(p.id);
        return pending !== undefined ? { ...p, sampleCount: pending } : p;
      }),
    [allPrescriptions, pendingPrescriptionSampleCounts]
  );

  const allLocalPrescriptionsWithPending = useMemo(
    () =>
      allLocalPrescriptions?.map((lp) => {
        const key = toLocalPrescriptionKeyString({
          prescriptionId: lp.prescriptionId,
          region: lp.region,
          department: lp.department ?? undefined,
          companySiret: lp.companySiret ?? undefined
        });
        const pending = pendingLocalChanges.get(key);
        return pending ? { ...lp, sampleCount: pending.sampleCount } : lp;
      }),
    [allLocalPrescriptions, pendingLocalChanges]
  );

  const prescriptions = useMemo(() => {
    return allPrescriptionsWithPending
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
          ? (allLocalPrescriptionsWithPending?.find(
              (_) => _.prescriptionId === p.id && isNil(_.companySiret)
            )?.sampleCount ?? 0) >
            sumBy(
              allLocalPrescriptionsWithPending?.filter(
                (_) => _.prescriptionId === p.id && !isNil(_.companySiret)
              ),
              'sampleCount'
            )
          : true
      )
      .filter((p) =>
        prescriptionFilters.missingLaboratory
          ? (allLocalPrescriptionsWithPending ?? []).some(
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
          allLocalPrescriptionsWithPending?.some(
            (_) => _.prescriptionId === p.id && _.sampleCount > 0
          )
      )
      .sort(PrescriptionSort);
  }, [
    allPrescriptionsWithPending,
    planIds,
    prescriptionFilters,
    allLocalPrescriptionsWithPending,
    hasNationalView
  ]);

  const localPrescriptions = useMemo(
    () =>
      filteredLocalPrescriptions(allLocalPrescriptionsWithPending ?? [], {
        region,
        department,
        companies
      }),
    [allLocalPrescriptionsWithPending, department, region, companies]
  );

  const subLocalPrescriptions = useMemo(
    () =>
      allLocalPrescriptionsWithPending
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
    [prescriptions, allLocalPrescriptionsWithPending, department, region]
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
    (key: LocalPrescriptionKey, count: number) => {
      setPendingLocalChanges((prev) => {
        const next = new Map(prev);
        next.set(toLocalPrescriptionKeyString(key), {
          key,
          sampleCount: count
        });
        return next;
      });
    },
    []
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

  const handleReset = useCallback(() => {
    setPendingLocalChanges(new Map());
    setPendingPrescriptionSampleCounts(new Map());
  }, []);

  useEffect(() => {
    onPendingChange?.(hasPendingChanges, handleReset);
  }, [hasPendingChanges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        ...Array.from(pendingLocalChanges.values()).map(
          ({ key, sampleCount }) =>
            changeLocalPrescription(key, {
              key: 'sampleCount',
              sampleCount,
              programmingPlanId: getPlanForPrescriptionId(key.prescriptionId).id
            })
        ),
        ...Array.from(pendingPrescriptionSampleCounts.entries()).map(
          ([prescriptionId, sampleCount]) => {
            const prescription = allPrescriptions?.find(
              (p) => p.id === prescriptionId
            );
            if (!prescription) return Promise.resolve();
            return changePrescription(prescription, { sampleCount });
          }
        )
      ]);
      setPendingLocalChanges(new Map());
      setPendingPrescriptionSampleCounts(new Map());
      setSaveSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }, [
    pendingLocalChanges,
    pendingPrescriptionSampleCounts,
    changeLocalPrescription,
    changePrescription,
    getPlanForPrescriptionId,
    allPrescriptions
  ]);

  const saveSuccessMessage = useMemo(() => {
    if (userRole === 'Administrator')
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux régions.';
    if (isNationalRole(userRole))
      return "Vos modifications ont été enregistrées avec succès. Pensez à les diffuser à l'administrateur et/ou aux régions.";
    if (isRegionalRole(userRole))
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux départements.';
    if (isDepartmentalRole(userRole))
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux préleveurs.';
    return 'Vos modifications ont été enregistrées avec succès.';
  }, [userRole]);

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
      <AppToast open={isDeleteSuccess} description="Matrice supprimée" />
      <AppToast
        open={saveSuccess}
        description={saveSuccessMessage}
        onClose={() => setSaveSuccess(false)}
      />

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
            (hasNationalView || hasRegionalView ? (
              <ProgrammingPrescriptionTable
                programmingPlans={programmingPlans}
                prescriptions={prescriptions}
                regionalPrescriptions={localPrescriptions}
                onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                pendingLocalKeys={new Set(pendingLocalChanges.keys())}
                {...(hasNationalView
                  ? {
                      pendingPrescriptionIds: new Set(
                        pendingPrescriptionSampleCounts.keys()
                      ),
                      onChangePrescriptionSampleCount: (
                        prescription,
                        sampleCount
                      ) => {
                        setPendingPrescriptionSampleCounts((prev) => {
                          const next = new Map(prev);
                          next.set(prescription.id, sampleCount);
                          return next;
                        });
                      }
                    }
                  : {
                      region: user?.region as Region,
                      subLocalPrescriptions: subLocalPrescriptions ?? []
                    })}
              />
            ) : (
              <ProgrammingLocalPrescriptionTable
                programmingPlans={programmingPlans}
                prescriptions={prescriptions}
                region={user?.region as Region}
                localPrescriptions={localPrescriptions}
                subLocalPrescriptions={subLocalPrescriptions ?? []}
                onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                pendingLocalKeys={new Set(pendingLocalChanges.keys())}
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
      {hasPendingChanges && (
        <PrescriptionActionBar
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </>
  );
};

export default ProgrammingPrescriptionList;
