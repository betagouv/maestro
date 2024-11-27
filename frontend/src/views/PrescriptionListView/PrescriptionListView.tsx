import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import _, { default as fp } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import {
  FindPrescriptionOptions,
  PrescriptionOptionsInclude
} from 'shared/schema/Prescription/FindPrescriptionOptions';
import { PrescriptionSort } from 'shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'shared/schema/Prescription/PrescriptionSubstance';
import {
  Context,
  ContextLabels,
  ContextList
} from 'shared/schema/ProgrammingPlan/Context';
import { NextProgrammingPlanStatus } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import PrescriptionCardNational from 'src/components/Prescription/PrescriptionCard/PrescriptionCardNational';
import PrescriptionCardRegional from 'src/components/Prescription/PrescriptionCard/PrescriptionCardRegional';
import PrescriptionAnalysisModal from 'src/components/Prescription/PrescriptionSubstances/PrescriptionSubstancesModal';
import ProgrammingPlanUpdateModal from 'src/components/ProgrammingPlan/ProgrammingPlanUpdateModal/ProgrammingPlanUpdateModal';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import AppToast from 'src/components/_app/AppToast/AppToast';
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
  const { userInfos, hasNationalView } = useAuthentication();

  const [addPrescription, { isSuccess: isAddSuccess }] =
    useAddPrescriptionMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [updateRegionalPrescription, { isSuccess: isUpdateRegionalSuccess }] =
    useUpdateRegionalPrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionMutation();

  const region: Region = useMemo(
    () =>
      userInfos?.region ?? (searchParams.get('region') as Region) ?? undefined,
    [userInfos, searchParams]
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

  const changeRegionalPrescriptionCount = useCallback(
    async (prescriptionId: string, region: Region, count: number) => {
      await updateRegionalPrescription({
        prescriptionId,
        region,
        prescriptionUpdate: {
          programmingPlanId: programmingPlan?.id as string,
          sampleCount: count
        }
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const changePrescriptionLaboratory =
    (programmingPlanId: string) =>
    async (prescriptionId: string, laboratoryId?: string) => {
      // TODO
      // await updatePrescription({
      //   prescriptionId,
      //   prescriptionUpdate: {
      //     programmingPlanId,
      //     context: findPrescriptionOptions.context,
      //     laboratoryId,
      //   },
      // });
    };

  const updatePrescriptionSubstances = useCallback(
    async (
      prescriptionId: string,
      prescriptionSubstances: PrescriptionSubstance[]
    ) => {
      await updatePrescription({
        prescriptionId,
        prescriptionUpdate: {
          programmingPlanId: programmingPlan?.id as string,
          substances: prescriptionSubstances
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
            </>
          }
        />
        {programmingPlan &&
          NextProgrammingPlanStatus[programmingPlan.status] && (
            <ProgrammingPlanUpdateModal programmingPlan={programmingPlan} />
          )}
      </div>

      <div
        className={clsx(
          'white-container',
          cx(
            'fr-px-2w',
            'fr-px-md-5w',
            'fr-py-2w',
            'fr-py-md-5w',
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
                />
              }
            </div>
            {prescriptionListDisplay === 'cards' && (
              <>
                {hasNationalView ? (
                  <div className="prescription-cards-container">
                    {prescriptions?.map((prescription) => (
                      <PrescriptionCardNational
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        regionalPrescriptions={regionalPrescriptions.filter(
                          (rp) => rp.prescriptionId === prescription.id
                        )}
                        onChangeRegionalPrescriptionCount={
                          changeRegionalPrescriptionCount
                        }
                        onRemovePrescription={removePrescription}
                        key={`prescription_cards_${prescription.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                    {prescriptions?.map((prescription) => (
                      <PrescriptionCardRegional
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        regionalPrescription={regionalPrescriptions.find(
                          (regionalPrescription) =>
                            regionalPrescription.prescriptionId ===
                              prescription.id &&
                            regionalPrescription.region === region
                        )}
                        key={`prescription_cards_${prescription.id}`}
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
                regions={region ? [region] : RegionList}
                onChangeRegionalPrescriptionCount={
                  changeRegionalPrescriptionCount
                }
                onChangePrescriptionLaboratory={changePrescriptionLaboratory(
                  programmingPlan.id
                )}
                onRemovePrescription={removePrescription}
              />
            )}
          </>
        )}
      </div>
      <PrescriptionAnalysisModal
        onUpdatePrescriptionSubstances={updatePrescriptionSubstances}
      />
    </section>
  );
};

export default PrescriptionListView;
