import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil, sumBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { LocalPrescriptionUpdate } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionSort,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionCard from 'src/components/Prescription/PrescriptionCard/PrescriptionCard';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import ProgrammingPrescriptionListHeader from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionListHeader';
import { assert, type Equals } from 'tsafe';
import LocalPrescriptionCard from '../../../components/LocalPrescription/LocalPrescriptionCard/LocalPrescriptionCard';
import LocalPrescriptionModal from '../../../components/LocalPrescription/LocalPrescriptionModal/LocalPrescriptionModal';
import PrescriptionModal from '../../../components/Prescription/PrescriptionModal/PrescriptionModal';
import { ApiClientContext } from '../../../services/apiClient';
import { getPrescriptionsExportURL } from '../../../services/prescription.service';
import ProgrammingLocalPrescriptionTable from '../ProgrammingPrescriptionTable/ProgrammingLocalPrescriptionTable';
import ProgrammingRegionalPrescriptionTable from '../ProgrammingPrescriptionTable/ProgrammingRegionalPrescriptionTable';

export type PrescriptionListDisplay = 'table' | 'cards';

interface Props {
  programmingPlan: ProgrammingPlan;
  region?: Region;
  department?: Department;
  companySiret?: string;
}

const ProgrammingPrescriptionList = ({
  programmingPlan,
  region,
  department,
  companySiret,
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
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    apiClient.useDeletePrescriptionMutation();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      programmingPlanKinds: prescriptionFilters.kinds,
      contexts: prescriptionFilters.context
        ? [prescriptionFilters.context]
        : undefined,
      region,
      includes: ['substanceCount' as const]
    }),
    [programmingPlan, prescriptionFilters, region]
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
    [findPrescriptionOptions, region, department, hasUserPermission]
  );

  const { data: allLocalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
      skip: !FindLocalPrescriptionOptions.safeParse(
        findLocalPrescriptionOptions
      ).success
    });

  const prescriptions = useMemo(() => {
    return allPrescriptions
      ?.filter((p) =>
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
      .filter((p) =>
        allLocalPrescriptions?.some(
          (_) => _.prescriptionId === p.id && _.sampleCount > 0
        )
      )
      .sort(PrescriptionSort);
  }, [allPrescriptions, prescriptionFilters, allLocalPrescriptions]);

  const localPrescriptions = useMemo(
    () =>
      allLocalPrescriptions?.filter((_) => {
        if (companySiret) {
          return (
            _.region === region &&
            _.department === department &&
            _.companySiret === companySiret
          );
        }
        if (department) {
          return (
            _.region === region &&
            _.department === department &&
            isNil(_.companySiret)
          );
        }
        return isNil(_.department);
      }),
    [allLocalPrescriptions, department, region, companySiret]
  );

  const subLocalPrescriptions = useMemo(
    () =>
      allLocalPrescriptions
        ?.filter((_) => prescriptions?.some((p) => p.id === _.prescriptionId))
        .filter((_) => {
          if (companySiret) {
            return false;
          }
          if (department) {
            return (
              _.region === region &&
              _.department === department &&
              !isNil(_.companySiret)
            );
          }
          return _.region === region && !isNil(_.department);
        }),
    [prescriptions, allLocalPrescriptions, department, region, companySiret]
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
            viewBy: 'MatrixKind',
            programmingPlan,
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
  }, [searchParams, localPrescriptions]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (hasUserPrescriptionPermission(programmingPlan)?.update) {
        await updatePrescription({
          prescriptionId: prescription.id,
          prescriptionUpdate: {
            programmingPlanId: programmingPlan.id,
            ...prescriptionUpdate
          }
        });
      }
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeLocalPrescription = useCallback(
    async (
      key: LocalPrescriptionKey,
      prescriptionUpdate: LocalPrescriptionUpdate
    ) => {
      await updateLocalPrescription({
        ...key,
        prescriptionUpdate
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeLocalPrescriptionCount = useCallback(
    async (key: LocalPrescriptionKey, count: number) =>
      changeLocalPrescription(key, {
        key: 'sampleCount',
        sampleCount: count,
        programmingPlanId: programmingPlan.id
      }),
    [changeLocalPrescription, programmingPlan]
  );

  const changeSubstanceKindsLaboratories = async (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => {
    await Promise.all(
      selectedPrescriptions.map((prescription) =>
        updateLocalPrescription({
          prescriptionId: prescription.id,
          region: region as Region,
          department: department,
          prescriptionUpdate: {
            key: 'laboratories',
            substanceKindsLaboratories,
            programmingPlanId: programmingPlan.id
          }
        })
      )
    );
  };

  const hasGroupedUpdatePermission = useMemo(
    () =>
      localPrescriptions?.some(
        (regionalPrescription) =>
          hasUserLocalPrescriptionPermission(
            programmingPlan,
            regionalPrescription
          )?.updateLaboratories
      ),
    [programmingPlan, localPrescriptions, hasUserLocalPrescriptionPermission]
  );

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
              programmingPlan={programmingPlan}
              prescriptions={prescriptions}
              localPrescriptions={localPrescriptions}
              subLocalPrescriptions={subLocalPrescriptions ?? []}
              exportURL={getPrescriptionsExportURL(findPrescriptionOptions)}
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
          {prescriptionListDisplay === 'cards' && prescriptions.length > 0 && (
            <>
              {hasNationalView ? (
                <div className="prescription-cards-container">
                  {prescriptions?.map((prescription) => (
                    <PrescriptionCard
                      key={`prescription_cards_${prescription.id}`}
                      programmingPlan={programmingPlan}
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
                  {prescriptions?.map((prescription) => (
                    <LocalPrescriptionCard
                      key={`prescription_cards_${prescription.id}`}
                      programmingPlan={programmingPlan}
                      prescription={prescription}
                      localPrescription={localPrescriptions.find(
                        (regionalPrescription) =>
                          regionalPrescription.prescriptionId ===
                          prescription.id
                      )}
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
                                prevState.some((_) => _.id === prescription.id)
                                  ? prevState.filter(
                                      (_) => _.id !== prescription.id
                                    )
                                  : [...prevState, prescription]
                              )
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {prescriptionListDisplay === 'table' && prescriptions.length > 0 && (
            <>
              {hasNationalView ? (
                <ProgrammingRegionalPrescriptionTable
                  programmingPlan={programmingPlan}
                  prescriptions={prescriptions}
                  regionalPrescriptions={localPrescriptions}
                  onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                />
              ) : (
                <ProgrammingLocalPrescriptionTable
                  programmingPlan={programmingPlan}
                  prescriptions={prescriptions}
                  region={user?.region as Region}
                  localPrescriptions={localPrescriptions}
                  subLocalPrescriptions={subLocalPrescriptions ?? []}
                  onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
                />
              )}
            </>
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
    </>
  );
};

export default ProgrammingPrescriptionList;
