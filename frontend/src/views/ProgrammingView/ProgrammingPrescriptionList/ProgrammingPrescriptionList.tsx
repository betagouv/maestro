import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { isNil } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { LocalPrescriptionUpdate } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
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
import ProgrammingPrescriptionTable from './ProgrammingPrescriptionTable';

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
  const { prescriptionListDisplay, matrixQuery, prescriptionFilters } =
    useAppSelector((state) => state.prescriptions);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    hasNationalView,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission
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

  const { data } = apiClient.useFindLocalPrescriptionsQuery(
    findLocalPrescriptionOptions,
    {
      skip: !FindLocalPrescriptionOptions.safeParse(
        findLocalPrescriptionOptions
      ).success
    }
  );

  const localPrescriptions = useMemo(
    () =>
      data?.filter((_) => {
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
    [data, department, region, companySiret]
  );

  const subLocalPrescriptions = useMemo(
    () =>
      data?.filter((_) => {
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
    [data, department, region, companySiret]
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
      prescription: Prescription,
      region: Region,
      prescriptionUpdate: LocalPrescriptionUpdate
    ) => {
      await updateLocalPrescription({
        prescriptionId: prescription.id,
        region,
        prescriptionUpdate
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changeLocalPrescriptionCount = useCallback(
    async (prescription: Prescription, region: Region, count: number) =>
      changeLocalPrescription(prescription, region, {
        key: 'sampleCount',
        sampleCount: count,
        programmingPlanId: programmingPlan.id
      }),
    [changeLocalPrescription, programmingPlan]
  );

  const changeLocalPrescriptionsLaboratory = useCallback(
    async (prescriptions: Prescription[], laboratoryId?: string) => {
      await Promise.all(
        prescriptions.map((prescription) =>
          changeLocalPrescription(prescription, region as Region, {
            key: 'laboratories',
            substanceKindsLaboratories: laboratoryId
              ? [
                  {
                    substanceKind: 'Any', //TODO
                    laboratoryId
                  }
                ]
              : [],
            programmingPlanId: programmingPlan.id
          })
        )
      );
      return;
    },
    [changeLocalPrescription, region, programmingPlan]
  );

  const hasGroupedUpdatePermission = useMemo(
    () =>
      programmingPlan.distributionKind === 'REGIONAL' &&
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
              onGroupedUpdate={async (laboratoryId) => {
                await changeLocalPrescriptionsLaboratory(
                  selectedPrescriptions,
                  laboratoryId
                );
                setSelectedPrescriptions([]);
              }}
              onSelectAll={() => {
                setSelectedPrescriptions(
                  selectedPrescriptions.length === prescriptions.length
                    ? []
                    : prescriptions
                );
              }}
            />
          }
          {prescriptionListDisplay === 'cards' && (
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
                  {prescriptions
                    ?.filter((prescription) =>
                      localPrescriptions.some(
                        (regionalPrescription) =>
                          regionalPrescription.prescriptionId ===
                            prescription.id &&
                          regionalPrescription.region === region &&
                          regionalPrescription.sampleCount > 0
                      )
                    )
                    .map((prescription) => (
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
                      />
                    ))}
                </div>
              )}
            </>
          )}
          {prescriptionListDisplay === 'table' && (
            <ProgrammingPrescriptionTable
              programmingPlan={programmingPlan}
              prescriptions={prescriptions}
              regionalPrescriptions={localPrescriptions}
              onChangeLocalPrescriptionCount={changeLocalPrescriptionCount}
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
    </>
  );
};

export default ProgrammingPrescriptionList;
