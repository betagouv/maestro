import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import _, { default as fp } from 'lodash';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { Stage } from 'maestro-shared/referential/Stage';
import {
  FindPrescriptionOptions,
  PrescriptionOptionsInclude
} from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionSort,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import {
  Context,
  ContextLabels,
  ContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { NextProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppToast from 'src/components/_app/AppToast/AppToast';
import PrescriptionCard from 'src/components/Prescription/PrescriptionCard/PrescriptionCard';
import PrescriptionSubstancesModal from 'src/components/Prescription/PrescriptionSubstancesModal/PrescriptionSubstancesModal';
import RegionalPrescriptionCard from 'src/components/Prescription/RegionalPrescriptionCard/RegionalPrescriptionCard';
import RegionalPrescriptionCommentsModal from 'src/components/Prescription/RegionalPrescriptionCommentsModal/RegionalPrescriptionCommentsModal';
import ProgrammingPlanUpdateModal from 'src/components/ProgrammingPlan/ProgrammingPlanUpdateModal/ProgrammingPlanUpdateModal';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import {
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation
} from 'src/services/prescription.service';
import {
  useCommentRegionalPrescriptionMutation,
  useFindRegionalPrescriptionsQuery,
  useUpdateRegionalPrescriptionMutation
} from 'src/services/regionalPrescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import PrescriptionListHeader from 'src/views/PrescriptionListView/PrescriptionListHeader';
import PrescriptionTable from 'src/views/PrescriptionListView/PrescriptionTable';
import programmation from '../../assets/illustrations/programmation.svg';

export type PrescriptionListDisplay = 'table' | 'cards';

const PrescriptionListView = () => {
  useDocumentTitle('Prescription');
  const dispatch = useAppDispatch();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { prescriptionListDisplay, matrixQuery, prescriptionListContext } =
    useAppSelector((state) => state.prescriptions);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
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
  const [commentRegionalPrescription, { isSuccess: isCommentSuccess }] =
    useCommentRegionalPrescriptionMutation();

  const region: Region = useMemo(
    () => user?.region ?? (searchParams.get('region') as Region) ?? undefined,
    [user, searchParams]
  );

  useEffect(() => {
    if (searchParams.get('context')) {
      dispatch(
        prescriptionsSlice.actions.changeListContext(
          searchParams.get('context') as Context
        )
      );
    }
  }, [searchParams, dispatch]);

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan?.id as string,
      context: prescriptionListContext,
      region,
      includes: ['substanceCount' as PrescriptionOptionsInclude]
    }),
    [programmingPlan, prescriptionListContext, region]
  );

  const { data: allPrescriptions } = useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !programmingPlan
    }
  );

  const prescriptions = useMemo(() => {
    return allPrescriptions
      ?.filter((p) =>
        matrixQuery
          ? MatrixLabels[p.matrix]
              .toLowerCase()
              .includes(matrixQuery.toLowerCase())
          : true
      )
      .sort(PrescriptionSort);
  }, [allPrescriptions, matrixQuery]);

  const { data: regionalPrescriptions } = useFindRegionalPrescriptionsQuery(
    {
      ...findPrescriptionOptions,
      includes: ['comments', 'realizedSampleCount']
    },
    {
      skip: !programmingPlan
    }
  );

  const changeFilter = useCallback(
    (findFilter: Partial<FindPrescriptionOptions>) => {
      const filteredParams = fp.omitBy(
        {
          ...fp.mapValues(findPrescriptionOptions, (value) =>
            value?.toString()
          ),
          ...fp.mapValues(findFilter, (value) => value?.toString())
        },
        fp.isEmpty
      );

      const urlSearchParams = new URLSearchParams(
        filteredParams as Record<string, string>
      );

      setSearchParams(urlSearchParams, { replace: true });
    },
    [findPrescriptionOptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const addMatrix = useCallback(
    async (programmingPlanId: string, matrix: Matrix) => {
      await addPrescription({
        programmingPlanId,
        context: prescriptionListContext,
        matrix,
        stages: []
      });
    },
    [prescriptionListContext] // eslint-disable-line react-hooks/exhaustive-deps
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
      if (
        programmingPlan &&
        hasUserPrescriptionPermission(programmingPlan)?.update
      ) {
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
          programmingPlanId: programmingPlan?.id as string,
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
          changeRegionalPrescription(prescriptionId, region, {
            laboratoryId
          })
        )
      );
      return;
    },
    [changeRegionalPrescription, region] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const submitRegionalPrescriptionComment = useCallback(
    async (
      regionalPrescriptionKey: RegionalPrescriptionKey,
      comment: string
    ) => {
      await commentRegionalPrescription({
        prescriptionId: regionalPrescriptionKey.prescriptionId,
        region: regionalPrescriptionKey.region,
        commentToCreate: {
          programmingPlanId: programmingPlan?.id as string,
          comment
        }
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <section className="main-section">
      <AppToast open={isAddSuccess} description="Matrice ajoutée" />
      <AppToast
        open={isUpdateSuccess || isUpdateRegionalSuccess}
        description="Modification enregistrée"
      />
      <AppToast open={isDeleteSuccess} description="Matrice supprimée" />
      <AppToast open={isCommentSuccess} description="Commentaire ajouté" />
      <div className={cx('fr-container')}>
        <SectionHeader
          title={`Programmation ${programmingPlan?.year}`}
          subtitle={region && Regions[region]?.name}
          illustration={programmation}
          action={
            <>
              <SegmentedControl
                hideLegend
                legend="Contexte"
                segments={
                  ContextList.map((context) => ({
                    label: ContextLabels[context],
                    nativeInputProps: {
                      checked: context === findPrescriptionOptions.context,
                      onChange: () =>
                        changeFilter({
                          context
                        })
                    }
                  })) as any
                }
              />
              {programmingPlan &&
                NextProgrammingPlanStatus[programmingPlan.status] &&
                ['Submitted', 'Validated'].includes(
                  NextProgrammingPlanStatus[programmingPlan.status] as string
                ) && (
                  <ProgrammingPlanUpdateModal
                    programmingPlan={programmingPlan}
                  />
                )}
            </>
          }
        />
      </div>

      <div
        className={clsx(
          'white-container',
          cx(
            'fr-px-2w',
            'fr-px-md-5w',
            'fr-py-2w',
            'fr-py-md-3w',
            'fr-container'
          )
        )}
      >
        {programmingPlan && prescriptions && regionalPrescriptions && (
          <>
            <div
              className={clsx(
                cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container'),
                'table-header'
              )}
            >
              {
                <PrescriptionListHeader
                  programmingPlan={programmingPlan}
                  findPrescriptionOptions={findPrescriptionOptions}
                  prescriptions={prescriptions}
                  addMatrix={(matrix) => addMatrix(programmingPlan.id, matrix)}
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
              <PrescriptionTable
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
      </div>
      <PrescriptionSubstancesModal
        onUpdatePrescriptionSubstances={updatePrescriptionSubstances}
      />
      <RegionalPrescriptionCommentsModal
        onSubmitRegionalPrescriptionComment={submitRegionalPrescriptionComment}
      />
    </section>
  );
};

export default PrescriptionListView;
