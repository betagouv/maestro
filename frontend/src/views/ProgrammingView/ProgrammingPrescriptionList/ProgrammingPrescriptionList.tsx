import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { sumBy } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionSort,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
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
import PrescriptionModal from '../../../components/Prescription/PrescriptionModal/PrescriptionModal';
import RegionalPrescriptionCard from '../../../components/RegionalPrescription/RegionalPrescriptionCard/RegionalPrescriptionCard';
import RegionalPrescriptionModal from '../../../components/RegionalPrescription/RegionalPrescriptionModal/RegionalPrescriptionModal';
import { ApiClientContext } from '../../../services/apiClient';
import { getPrescriptionsExportURL } from '../../../services/prescription.service';
import ProgrammingPrescriptionTable from './ProgrammingPrescriptionTable';

export type PrescriptionListDisplay = 'table' | 'cards';

interface Props {
  programmingPlan: ProgrammingPlan;
  region?: Region;
}

const ProgrammingPrescriptionList = ({
  programmingPlan,
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

  const [selectedPrescriptions, setSelectedPrescriptions] = useState<
    Prescription[]
  >([]);

  const [_, { isSuccess: isAddSuccess }] =
    apiClient.useAddPrescriptionMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    apiClient.useUpdatePrescriptionMutation();
  const [updateRegionalPrescription, { isSuccess: isUpdateRegionalSuccess }] =
    apiClient.useUpdateRegionalPrescriptionMutation();
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
  }, [searchParams, regionalPrescriptions]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const changeRegionalPrescription = useCallback(
    async (
      prescription: Prescription,
      region: Region,
      prescriptionUpdate: Omit<RegionalPrescriptionUpdate, 'programmingPlanId'>
    ) => {
      await updateRegionalPrescription({
        prescriptionId: prescription.id,
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
          {
            <ProgrammingPrescriptionListHeader
              programmingPlan={programmingPlan}
              prescriptions={prescriptions}
              exportURL={getPrescriptionsExportURL(findPrescriptionOptions)}
              sampleCount={sumBy(regionalPrescriptions, 'sampleCount')}
              hasGroupedUpdatePermission={regionalPrescriptions.some(
                (regionalPrescription) =>
                  hasUserRegionalPrescriptionPermission(
                    programmingPlan,
                    regionalPrescription
                  )?.updateLaboratory
              )}
              selectedCount={selectedPrescriptions.length}
              onGroupedUpdate={async (laboratoryId) => {
                await changeRegionalPrescriptionsLaboratory(
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
                  {prescriptions
                    ?.filter((prescription) =>
                      regionalPrescriptions.some(
                        (regionalPrescription) =>
                          regionalPrescription.prescriptionId ===
                            prescription.id &&
                          regionalPrescription.region === region &&
                          regionalPrescription.sampleCount > 0
                      )
                    )
                    .map((prescription) => (
                      <RegionalPrescriptionCard
                        key={`prescription_cards_${prescription.id}`}
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        regionalPrescription={regionalPrescriptions.find(
                          (regionalPrescription) =>
                            regionalPrescription.prescriptionId ===
                              prescription.id &&
                            regionalPrescription.region === region &&
                            !regionalPrescription.department
                        )}
                        departmentalPrescriptions={regionalPrescriptions.filter(
                          (regionalPrescription) =>
                            regionalPrescription.prescriptionId ===
                              prescription.id &&
                            regionalPrescription.region === region &&
                            regionalPrescription.department
                        )}
                        isSelected={selectedPrescriptions.some(
                          (_) => _.id === prescription.id
                        )}
                        onToggleSelection={() => {
                          setSelectedPrescriptions((prevState) =>
                            prevState.some((_) => _.id === prescription.id)
                              ? prevState.filter(
                                  (_) => _.id !== prescription.id
                                )
                              : [...prevState, prescription]
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
      <PrescriptionModal
        onUpdatePrescriptionSubstances={(prescription, substances) =>
          changePrescription(prescription, {
            substances
          })
        }
      />
      <RegionalPrescriptionModal
        onChangePrescriptionLaboratory={(prescription, laboratoryId) =>
          changeRegionalPrescriptionsLaboratory([prescription], laboratoryId)
        }
      />
    </>
  );
};

export default ProgrammingPrescriptionList;
