import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { groupBy, isEmpty, isNil, mapValues, omit, omitBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { Company } from 'maestro-shared/schema/Company/Company';
import {
  filteredLocalPrescriptions,
  type LocalPrescription,
  type LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  hasUnviewedChange,
  regionRowNeedsChangeAction
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
import {
  type LocalPrescriptionKey,
  type LocalPrescriptionKeyString,
  toLocalPrescriptionKeyString,
  toLocalPrescriptionRegionalKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  type Prescription,
  PrescriptionSort,
  type PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import type { PrescriptionImportResult } from 'maestro-shared/schema/Prescription/PrescriptionImport';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';
import {
  isDepartmentalRole,
  isNationalRole,
  isRegionalRole
} from 'maestro-shared/schema/User/UserRole';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionActionBar from 'src/components/Prescription/PrescriptionActionBar/PrescriptionActionBar';
import SelectionActionBar from 'src/components/SelectionActionBar/SelectionActionBar';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { usePrescriptionFilters } from 'src/hooks/usePrescriptionFilters';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import PrescriptionImportModal, {
  prescriptionImportModal
} from 'src/views/ProgrammingView/ProgrammingPrescriptionList/PrescriptionImportModal';
import ProgrammingPrescriptionListHeader from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListHeader';
import { assert, type Equals } from 'tsafe';
import LocalPrescriptionModal from '../../../components/LocalPrescription/LocalPrescriptionModal/LocalPrescriptionModal';
import PrescriptionModal from '../../../components/Prescription/PrescriptionModal/PrescriptionModal';
import { ApiClientContext } from '../../../services/apiClient';
import { getApiUrl } from '../../../utils/fetchUtils';
import ProgrammingPrescriptionFilters from '../ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
import ProgrammingPrescriptionTable from '../ProgrammingPrescriptionTable/ProgrammingPrescriptionTable';
import BulkAssignLaboratoriesModal, {
  bulkAssignLaboratoriesModal
} from './BulkAssignLaboratoriesModal';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  region?: Region;
  department?: Department;
  companies?: Company[];
  onPendingChange?: (hasPendingChanges: boolean, reset: () => void) => void;
  onChangeDismissalCandidatesChange?: (prescriptionIds: string[]) => void;
}

const ProgrammingPrescriptionList = ({
  programmingPlans,
  region,
  department,
  companies,
  onPendingChange,
  onChangeDismissalCandidatesChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    hasNationalView,
    hasRegionalView,
    hasDepartmentalView,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission,
    userRole,
    user
  } = useAuthentication();

  const canBulkAssignLaboratories =
    (hasRegionalView || hasDepartmentalView) && !hasNationalView;

  const [selectedPrescriptions, setSelectedPrescriptions] = useState<
    Prescription[]
  >([]);

  const [pendingLocalChanges, setPendingLocalChanges] = useState<
    Map<
      LocalPrescriptionKeyString,
      { key: LocalPrescriptionKey; sampleCount: number }
    >
  >(new Map());
  const [pendingLaboratoryChanges, setPendingLaboratoryChanges] = useState<
    Map<
      LocalPrescriptionKeyString,
      {
        key: LocalPrescriptionKey;
        substanceKindsLaboratories: SubstanceKindLaboratory[];
      }
    >
  >(new Map());
  const [pendingPrescriptionSampleCounts, setPendingPrescriptionSampleCounts] =
    useState<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importResult, setImportResult] = useState<
    PrescriptionImportResult | undefined
  >(undefined);

  const canImport = hasNationalView && hasUserPermission('updatePrescription');

  const hasPendingChanges =
    pendingLocalChanges.size > 0 ||
    pendingLaboratoryChanges.size > 0 ||
    pendingPrescriptionSampleCounts.size > 0;

  const [_, { isSuccess: isAddSuccess }] =
    apiClient.useAddPrescriptionMutation();
  const [updatePrescription] = apiClient.useUpdatePrescriptionMutation();
  const [updateLocalPrescription] =
    apiClient.useUpdateLocalPrescriptionMutation();
  const [updateDepartmentalLocalPrescription] =
    apiClient.useUpdateDepartmentalLocalPrescriptionMutation();

  const {
    programmingPlanOptions,
    programmingSubPlanOptions,
    contextOptions,
    reduceFilters
  } = usePrescriptionFilters(programmingPlans);

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

  const findPrescriptionCountsOptions = useMemo(
    () => ({
      programmingPlanIds: planIds,
      year: prescriptionFilters.year,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      programmingPlanDomainIds: prescriptionFilters.programmingPlanDomainIds,
      contexts: prescriptionFilters.outsideProgrammingPlan
        ? undefined
        : prescriptionFilters.contexts,
      matrices: prescriptionFilters.matrices,
      coordinatorIds: prescriptionFilters.coordinatorIds,
      laboratoryIds: prescriptionFilters.laboratoryIds,
      missingSlaughterhouse: prescriptionFilters.missingSlaughterhouse,
      missingLaboratory: prescriptionFilters.missingLaboratory,
      withSampleCountOnly: !hasNationalView,
      region,
      department
    }),
    [planIds, prescriptionFilters, region, department, hasNationalView]
  );

  const findPrescriptionOptions = useMemo(
    () => ({
      ...findPrescriptionCountsOptions,
      subPlanStage: prescriptionFilters.stage,
      includes: ['substanceCount' as const]
    }),
    [findPrescriptionCountsOptions, prescriptionFilters.stage]
  );

  const exportPrescriptionOptions = useMemo(
    () => omit(findPrescriptionOptions, 'includes'),
    [findPrescriptionOptions]
  );

  const {
    data: allPrescriptions,
    refetch: refetchPrescriptions,
    isUninitialized: isPrescriptionsUninitialized
  } = apiClient.useFindPrescriptionsQuery(findPrescriptionOptions, {
    skip:
      !planIds.length ||
      !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
  });

  const { data: departmentCompanies } = apiClient.useFindCompaniesQuery(
    {
      region,
      department,
      kinds: ['POULTRY_SLAUGHTERHOUSE', 'MEAT_SLAUGHTERHOUSE']
    },
    { skip: !region || !department }
  );

  const effectiveCompanies = department
    ? (departmentCompanies ?? [])
    : companies;

  const findLocalPrescriptionOptions = useMemo(
    () => ({
      programmingPlanIds: planIds,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      contexts: prescriptionFilters.outsideProgrammingPlan
        ? undefined
        : prescriptionFilters.contexts,
      region,
      department,
      includes: [
        'sampleCounts' as const,
        ...(hasUserPermission('commentPrescription')
          ? ['comments' as const]
          : []),
        ...(hasUserPermission('updatePrescriptionLaboratories')
          ? ['laboratories' as const]
          : []),
        'pendingChanges' as const
      ]
    }),
    [planIds, prescriptionFilters, region, department, hasUserPermission]
  );

  const {
    data: allLocalPrescriptions,
    refetch: refetchLocalPrescriptions,
    isUninitialized: isLocalPrescriptionsUninitialized
  } = apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
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

  const allLocalPrescriptionsWithPending = useMemo(() => {
    const existing = (allLocalPrescriptions ?? []).map((lp) => {
      const key = toLocalPrescriptionKeyString({
        prescriptionId: lp.prescriptionId,
        region: lp.region,
        department: lp.department ?? undefined,
        companySiret: lp.companySiret ?? undefined
      });
      const pending = pendingLocalChanges.get(key);
      const pendingLab = pendingLaboratoryChanges.get(key);
      return {
        ...lp,
        ...(pending ? { sampleCount: pending.sampleCount } : {}),
        ...(pendingLab
          ? {
              substanceKindsLaboratories: pendingLab.substanceKindsLaboratories
            }
          : {})
      };
    });

    const existingKeys = new Set(
      existing.map((lp) =>
        toLocalPrescriptionKeyString({
          prescriptionId: lp.prescriptionId,
          region: lp.region,
          department: lp.department ?? undefined,
          companySiret: lp.companySiret ?? undefined
        })
      )
    );
    const pendingOnly: LocalPrescription[] = Array.from(
      pendingLocalChanges.values()
    )
      .filter(({ key }) => !existingKeys.has(toLocalPrescriptionKeyString(key)))
      .map(({ key, sampleCount }) => ({
        prescriptionId: key.prescriptionId,
        region: key.region,
        department: key.department,
        companySiret: key.companySiret,
        sampleCount
      }));

    return [...existing, ...pendingOnly];
  }, [allLocalPrescriptions, pendingLocalChanges, pendingLaboratoryChanges]);

  const { data: prescriptionCounts } = apiClient.useFindPrescriptionCountsQuery(
    findPrescriptionCountsOptions,
    { skip: !planIds.length }
  );

  const prescriptions = useMemo(
    () => allPrescriptionsWithPending?.toSorted(PrescriptionSort),
    [allPrescriptionsWithPending]
  );

  const stageCounts = useMemo(
    () => prescriptionCounts?.stageCounts ?? [],
    [prescriptionCounts]
  );

  const matrixKindOptions = useMemo(
    () => prescriptionCounts?.matrixKinds ?? [],
    [prescriptionCounts]
  );

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

  const canActOnPrescriptionRows =
    hasUserPermission('updatePrescriptionLaboratories') ||
    hasUserPermission('distributePrescriptionToDepartments') ||
    hasUserPermission('distributePrescriptionToSlaughterhouses');

  useEffect(() => {
    if (!region) {
      onChangeDismissalCandidatesChange?.([]);
      return;
    }
    const candidates = (prescriptions ?? [])
      .map((prescription) => {
        const own = localPrescriptions.find(
          (lp) => lp.prescriptionId === prescription.id
        );
        if (!own || !hasUnviewedChange(own.changedAt)) {
          return null;
        }
        const plan = getPrescriptionPlan(prescription);
        const subs = (subLocalPrescriptions ?? []).filter(
          (sub) => sub.prescriptionId === prescription.id
        );
        return canActOnPrescriptionRows &&
          regionRowNeedsChangeAction(plan.distributionKind, own, subs)
          ? null
          : prescription.id;
      })
      .filter((id): id is string => id !== null);
    onChangeDismissalCandidatesChange?.(candidates);
  }, [
    region,
    prescriptions,
    localPrescriptions,
    subLocalPrescriptions,
    getPrescriptionPlan,
    onChangeDismissalCandidatesChange
  ]);

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

  const openComments = useCallback(
    (prescription: Prescription) => {
      const regionalCommentsList = (allLocalPrescriptions ?? [])
        .filter(
          (_) => _.prescriptionId === prescription.id && isNil(_.department)
        )
        .map((_) => ({
          region: _.region,
          department: _.department,
          comments: _.comments ?? []
        }));

      const commentedRegions = regionalCommentsList.filter(
        (_) => _.comments.length > 0
      );

      dispatch(
        prescriptionsSlice.actions.setPrescriptionCommentsData({
          viewBy: 'Prescription',
          programmingPlan: getPrescriptionPlan(prescription),
          prescription,
          regionalCommentsList: commentedRegions.length
            ? commentedRegions
            : regionalCommentsList
        })
      );
    },
    [dispatch, getPrescriptionPlan, allLocalPrescriptions]
  );

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

  const changeLocalPrescriptionLaboratories = useCallback(
    (
      key: LocalPrescriptionKey,
      substanceKindsLaboratories: SubstanceKindLaboratory[]
    ) => {
      setPendingLaboratoryChanges((prev) => {
        const next = new Map(prev);
        next.set(toLocalPrescriptionKeyString(key), {
          key,
          substanceKindsLaboratories
        });
        return next;
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    setPendingLocalChanges(new Map());
    setPendingLaboratoryChanges(new Map());
    setPendingPrescriptionSampleCounts(new Map());
  }, []);

  useEffect(() => {
    onPendingChange?.(hasPendingChanges, handleReset);
  }, [hasPendingChanges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const plainLocalChanges = Array.from(pendingLocalChanges.values()).filter(
        ({ key }) => !key.companySiret
      );
      const slaughterhouseChangeGroups = Object.values(
        groupBy(
          Array.from(pendingLocalChanges.values()).filter(
            ({ key }) => key.companySiret
          ),
          ({ key }) => toLocalPrescriptionRegionalKeyString(key)
        )
      );

      await Promise.all([
        ...plainLocalChanges.map(({ key, sampleCount }) =>
          changeLocalPrescription(key, {
            key: 'sampleCount',
            sampleCount,
            programmingPlanId: getPlanForPrescriptionId(key.prescriptionId).id
          })
        ),
        ...slaughterhouseChangeGroups.map((entries) => {
          const { prescriptionId, region, department } = entries[0].key;
          const pendingBySiret = new Map(
            entries.map(({ key, sampleCount }) => [
              key.companySiret as string,
              sampleCount
            ])
          );
          const slaughterhouseSampleCounts = (effectiveCompanies ?? []).map(
            (company) => ({
              companySiret: company.siret,
              sampleCount:
                pendingBySiret.get(company.siret) ??
                subLocalPrescriptions?.find(
                  (sp) =>
                    sp.prescriptionId === prescriptionId &&
                    sp.companySiret === company.siret
                )?.sampleCount ??
                0
            })
          );
          return changeLocalPrescription(
            { prescriptionId, region, department },
            {
              key: 'slaughterhouseSampleCounts',
              slaughterhouseSampleCounts,
              programmingPlanId: getPlanForPrescriptionId(prescriptionId).id
            }
          );
        }),
        ...Array.from(pendingLaboratoryChanges.values()).map(
          ({ key, substanceKindsLaboratories }) =>
            changeLocalPrescription(key, {
              key: 'laboratories',
              substanceKindsLaboratories,
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
      await Promise.all([
        isPrescriptionsUninitialized ? undefined : refetchPrescriptions(),
        isLocalPrescriptionsUninitialized
          ? undefined
          : refetchLocalPrescriptions()
      ]);
      setPendingLocalChanges(new Map());
      setPendingLaboratoryChanges(new Map());
      setPendingPrescriptionSampleCounts(new Map());
      setSaveSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }, [
    pendingLocalChanges,
    pendingLaboratoryChanges,
    pendingPrescriptionSampleCounts,
    changeLocalPrescription,
    changePrescription,
    getPlanForPrescriptionId,
    allPrescriptions,
    effectiveCompanies,
    subLocalPrescriptions,
    refetchPrescriptions,
    refetchLocalPrescriptions,
    isPrescriptionsUninitialized,
    isLocalPrescriptionsUninitialized
  ]);

  const saveSuccessMessage = useMemo(() => {
    if (userRole === 'AdministratorMaestro' || userRole === 'AdministratorBGIR')
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux régions dans "Suivi des plans".';
    if (isNationalRole(userRole))
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser à l\'administrateur et/ou aux régions dans "Suivi des plans".';
    if (isRegionalRole(userRole)) {
      const hasRegionalKind = programmingPlans.some(
        (plan) => plan.distributionKind === 'REGIONAL'
      );
      const hasSlaughterhouseKind = programmingPlans.some(
        (plan) => plan.distributionKind === 'SLAUGHTERHOUSE'
      );
      if (hasRegionalKind && !hasSlaughterhouseKind) {
        return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux préleveurs dans "Suivi des plans".';
      }
      if (hasSlaughterhouseKind && !hasRegionalKind) {
        return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux départements dans "Suivi des plans".';
      }
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux préleveurs et/ou aux départements dans "Suivi des plans".';
    }
    if (isDepartmentalRole(userRole))
      return 'Vos modifications ont été enregistrées avec succès. Pensez à les diffuser aux préleveurs dans "Suivi des plans".';
    return 'Vos modifications ont été enregistrées avec succès.';
  }, [userRole, programmingPlans]);

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

  const togglePrescriptionSelection = hasGroupedUpdatePermission
    ? (prescription: Prescription) => {
        setSelectedPrescriptions((prevState) =>
          prevState.some((_) => _.id === prescription.id)
            ? prevState.filter((_) => _.id !== prescription.id)
            : [...prevState, prescription]
        );
      }
    : undefined;

  const [bulkAssignBannerHeight, setBulkAssignBannerHeight] = useState(0);

  const laboratorySlotsFor = useCallback(
    (prescription: Prescription) => {
      const plan = getPrescriptionPlan(prescription);
      const isLaboratoryEchelon =
        plan.distributionKind === 'REGIONAL' ? !department : !!department;
      if (!isLaboratoryEchelon) {
        return [];
      }
      const regional = localPrescriptions.find(
        (lp) => lp.prescriptionId === prescription.id
      );
      if (!regional) {
        return [];
      }
      const subPlan = plan.subPlans.find(
        (sp) => sp.id === prescription.programmingSubPlanId
      );
      return [...(subPlan?.substanceKinds ?? [])]
        .sort()
        .map((substanceKind) => ({
          substanceKind,
          laboratoryId: regional.substanceKindsLaboratories?.find(
            (skl) => skl.substanceKind === substanceKind
          )?.laboratoryId
        }));
    },
    [getPrescriptionPlan, localPrescriptions, department]
  );

  const bulkAssignCheck = useMemo(():
    | {
        commonSlots: { substanceKind: SubstanceKind; laboratoryId?: string }[];
        blockReason?: undefined;
      }
    | { commonSlots: []; blockReason: string } => {
    const slotsPerPrescription = selectedPrescriptions.map(laboratorySlotsFor);
    const [firstSlots, ...otherSlots] = slotsPerPrescription;

    const sameSubstanceKinds =
      firstSlots &&
      firstSlots.length > 0 &&
      otherSlots.every(
        (slots) =>
          slots.length === firstSlots.length &&
          slots.every((s, i) => s.substanceKind === firstSlots[i].substanceKind)
      );

    if (!sameSubstanceKinds) {
      return {
        commonSlots: [],
        blockReason:
          "Les sous-plans sélectionnés n'ont pas le même nombre de laboratoires à attribuer. L'action groupée n'est pas possible."
      };
    }

    const slotLaboratoryIds = firstSlots.map((_, index) => {
      const laboratoryIds = new Set(
        slotsPerPrescription
          .map((slots) => slots[index].laboratoryId)
          .filter((id): id is string => !!id)
      );
      return laboratoryIds;
    });

    if (slotLaboratoryIds.some((laboratoryIds) => laboratoryIds.size > 1)) {
      return {
        commonSlots: [],
        blockReason:
          "Les sous-plans sélectionnés ont des laboratoires déjà attribués différents. L'action groupée n'est pas possible."
      };
    }

    return {
      commonSlots: firstSlots.map((slot, index) => ({
        substanceKind: slot.substanceKind,
        laboratoryId: [...slotLaboratoryIds[index]][0]
      }))
    };
  }, [selectedPrescriptions, laboratorySlotsFor]);

  const headerPlan = programmingPlans[0];

  return (
    <>
      {canImport && prescriptionFilters.year && (
        <PrescriptionImportModal
          year={prescriptionFilters.year}
          onImported={setImportResult}
        />
      )}
      <AppToast
        open={importResult?.unrecognized.length === 0}
        description="Votre fichier a été importé avec succès."
        onClose={() => setImportResult(undefined)}
      />
      {importResult && importResult.unrecognized.length > 0 && (
        <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-2w')}>
          <Alert
            severity="warning"
            closable
            onClose={() => setImportResult(undefined)}
            title="Vos fichier a été importé partiellement."
            description={
              <>
                Les données suivantes n’ont pas pu être importées car Maestro ne
                les a pas reconnues :
                <ul>
                  {importResult.unrecognized.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              </>
            }
          />
        </div>
      )}
      <AppToast open={isAddSuccess} description="Matrice ajoutée" />
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
              region={region}
              exportURL={getApiUrl(
                '/prescriptions/export',
                exportPrescriptionOptions
              )}
              onImport={
                canImport ? () => prescriptionImportModal.open() : undefined
              }
            />
          }
          <ProgrammingPrescriptionFilters
            options={{
              plans: programmingPlanOptions(prescriptionFilters),
              programmingSubPlanIds:
                programmingSubPlanOptions(prescriptionFilters),
              matrixKinds: matrixKindOptions,
              contexts: contextOptions(prescriptionFilters)
            }}
            stageCounts={stageCounts}
            filters={prescriptionFilters}
            onChange={changeFilter}
          />
          {prescriptions.length === 0 && (
            <div
              className={clsx(
                cx('fr-container', 'fr-mt-8w', 'fr-px-7w'),
                'align-center'
              )}
            >
              Aucun prélèvement programmé pour les filtres sélectionnés
            </div>
          )}
          {canBulkAssignLaboratories && (
            <SelectionActionBar
              selectedCount={selectedPrescriptions.length}
              itemLabel="sous-plan sélectionné"
              onDeselectAll={() => setSelectedPrescriptions([])}
              onHeightChange={setBulkAssignBannerHeight}
              notice={
                bulkAssignCheck.blockReason
                  ? { description: bulkAssignCheck.blockReason }
                  : undefined
              }
            >
              <Button
                priority="secondary"
                size="small"
                iconId="fr-icon-list-check"
                disabled={!!bulkAssignCheck.blockReason}
                onClick={() => bulkAssignLaboratoriesModal.open()}
                className={cx('fr-ml-3w')}
              >
                Attribuer les laboratoires
              </Button>
            </SelectionActionBar>
          )}
          {prescriptions.length > 0 && (
            <ProgrammingPrescriptionTable
              programmingPlans={programmingPlans}
              prescriptions={prescriptions}
              regionalPrescriptions={localPrescriptions}
              onOpenComments={openComments}
              onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
              pendingLocalKeys={new Set(pendingLocalChanges.keys())}
              onChangeLocalPrescriptionLaboratories={
                changeLocalPrescriptionLaboratories
              }
              pendingLaboratoryKeys={new Set(pendingLaboratoryChanges.keys())}
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
                : userRole === 'Sampler'
                  ? {
                      region: user?.region as Region,
                      department
                    }
                  : {
                      region: user?.region as Region,
                      department,
                      companies: effectiveCompanies,
                      subLocalPrescriptions: subLocalPrescriptions ?? [],
                      selectedPrescriptions,
                      onTogglePrescriptionSelection:
                        togglePrescriptionSelection,
                      topOffset: bulkAssignBannerHeight
                    })}
            />
          )}
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
      {canBulkAssignLaboratories && (
        <BulkAssignLaboratoriesModal
          programmingPlanId={headerPlan.id}
          commonSlots={bulkAssignCheck.commonSlots}
          onSubmit={(substanceKindsLaboratories) => {
            for (const prescription of selectedPrescriptions) {
              changeLocalPrescriptionLaboratories(
                {
                  prescriptionId: prescription.id,
                  region: region as Region,
                  department
                },
                substanceKindsLaboratories
              );
            }
            bulkAssignLaboratoriesModal.close();
            setSelectedPrescriptions([]);
          }}
        />
      )}
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
