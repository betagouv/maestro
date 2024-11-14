import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import _, { default as fp } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { Stage } from 'shared/referential/Stage';
import {
  FindPrescriptionOptions,
  FindPrescriptionOptionsInclude,
} from 'shared/schema/Prescription/FindPrescriptionOptions';
import {
  genPrescriptionByMatrix,
  PrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import {
  Context,
  ContextLabels,
  ContextList,
} from 'shared/schema/ProgrammingPlan/Context';
import { userRegions } from 'shared/schema/User/User';
import AutoClose from 'src/components/AutoClose/AutoClose';
import PrescriptionCardNational from 'src/components/Prescription/PrescriptionCard/PrescriptionCardNational';
import PrescriptionCardRegional from 'src/components/Prescription/PrescriptionCard/PrescriptionCardRegional';
import ProgrammingPlanSubmissionModal from 'src/components/ProgrammingPlan/ProgrammingPlanSubmissionModal/ProgrammingPlanSubmissionModal';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import {
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
} from 'src/services/prescription.service';
import { useFindSamplesQuery } from 'src/services/sample.service';
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

  const [addPrescriptions, { isSuccess: isAddSuccess }] =
    useAddPrescriptionsMutation();
  const [updatePrescription, { isSuccess: isUpdateSuccess }] =
    useUpdatePrescriptionMutation();
  const [deletePrescription, { isSuccess: isDeleteSuccess }] =
    useDeletePrescriptionsMutation();

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
    }),
    [programmingPlan, prescriptionListContext, region]
  );

  const { data: allPrescriptions } = useFindPrescriptionsQuery(
    {
      ...findPrescriptionOptions,
      includes: 'comments' as FindPrescriptionOptionsInclude,
    },
    {
      skip: !programmingPlan,
    }
  );

  const prescriptions = useMemo(() => {
    return allPrescriptions?.filter((p) =>
      matrixQuery
        ? MatrixLabels[p.matrix]
            .toLowerCase()
            .includes(matrixQuery.toLowerCase())
        : true
    );
  }, [allPrescriptions, matrixQuery]);

  const { data: samples } = useFindSamplesQuery(
    {
      ...findPrescriptionOptions,
      status: 'Sent',
    },
    {
      skip: !programmingPlan,
    }
  );

  const prescriptionsByMatrix = useMemo(() => {
    if (!prescriptions || !samples) return [];
    return genPrescriptionByMatrix(
      prescriptions,
      samples,
      region ? [region] : RegionList
    );
  }, [prescriptions, samples, region]);

  const changeFilter = (findFilter: Partial<FindPrescriptionOptions>) => {
    const filteredParams = fp.omitBy(
      {
        ...fp.mapValues(findPrescriptionOptions, (value) => value?.toString()),
        ...fp.mapValues(findFilter, (value) => value?.toString()),
      },
      fp.isEmpty
    );

    const urlSearchParams = new URLSearchParams(
      filteredParams as Record<string, string>
    );

    setSearchParams(urlSearchParams, { replace: true });
  };

  const addMatrix = async (
    programmingPlanId: string,
    matrix: Matrix,
    stages: Stage[]
  ) => {
    await addPrescriptions({
      programmingPlanId,
      context: prescriptionListContext,
      prescriptions: RegionList.map((region) => ({
        matrix,
        stages,
        region,
        sampleCount: 0,
      })),
    });
  };

  const removePrescriptionByMatrix = async (
    prescriptionsByMatrix: PrescriptionByMatrix
  ) => {
    await deletePrescription({
      programmingPlanId: prescriptionsByMatrix.programmingPlanId,
      context: prescriptionsByMatrix.context,
      prescriptionIds: (prescriptions ?? [])
        .filter(
          (p) =>
            p.matrix === prescriptionsByMatrix.matrix &&
            _.isEqual(p.stages, prescriptionsByMatrix.stages)
        )
        .map((p) => p.id),
    });
  };

  const changePrescriptionCount =
    (programmingPlanId: string) =>
    async (prescriptionId: string, count: number) => {
      await updatePrescription({
        prescriptionId,
        prescriptionUpdate: {
          programmingPlanId,
          context: findPrescriptionOptions.context,
          sampleCount: count,
        },
      });
    };

  const changePrescriptionLaboratory =
    (programmingPlanId: string) =>
    async (prescriptionId: string, laboratoryId?: string) => {
      await updatePrescription({
        prescriptionId,
        prescriptionUpdate: {
          programmingPlanId,
          context: findPrescriptionOptions.context,
          laboratoryId,
        },
      });
    };

  return (
    <section className="main-section">
      {isAddSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small
              description="Matrice ajoutée"
              closable
            />
          </div>
        </AutoClose>
      )}
      {isUpdateSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small
              description="Modification enregistrée"
              closable
            />
          </div>
        </AutoClose>
      )}
      {isDeleteSuccess && (
        <AutoClose>
          <div className="toast">
            <Alert
              severity="success"
              small
              description="Matrice supprimée"
              closable
            />
          </div>
        </AutoClose>
      )}
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
                          context,
                        }),
                    },
                  })) as any
                }
              />
              {programmingPlan && (
                <ProgrammingPlanSubmissionModal
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
            'fr-py-md-5w',
            'fr-container'
          )
        )}
      >
        {programmingPlan && prescriptions && samples && (
          <>
            <div
              className={clsx(
                cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-container'),
                'table-header'
              )}
            >
              {
                <PrescriptionListHeader
                  programmingPlan={programmingPlan}
                  findPrescriptionOptions={findPrescriptionOptions}
                  prescriptions={prescriptions}
                  addMatrix={(matrix, stages) =>
                    addMatrix(programmingPlan.id, matrix, stages)
                  }
                />
              }
            </div>
            {prescriptionListDisplay === 'cards' && (
              <div
                className={
                  userRegions(userInfos).length === 1
                    ? cx('fr-grid-row', 'fr-grid-row--gutters')
                    : 'prescription-cards-container'
                }
              >
                {prescriptionsByMatrix.map((prescriptionByMatrix) => (
                  <>
                    {hasNationalView ? (
                      <PrescriptionCardNational
                        programmingPlan={programmingPlan}
                        prescriptionByMatrix={prescriptionByMatrix}
                        onChangePrescriptionCount={changePrescriptionCount(
                          programmingPlan.id
                        )}
                        onRemovePrescriptionByMatrix={
                          removePrescriptionByMatrix
                        }
                        key={`prescription_${prescriptionByMatrix.matrix}`}
                      />
                    ) : (
                      <PrescriptionCardRegional
                        programmingPlan={programmingPlan}
                        prescriptionByMatrix={prescriptionByMatrix}
                        key={`prescription_${prescriptionByMatrix.matrix}`}
                      />
                    )}
                  </>
                ))}
              </div>
            )}
            {prescriptionListDisplay === 'table' && (
              <PrescriptionTable
                programmingPlan={programmingPlan}
                context={findPrescriptionOptions.context}
                prescriptionsByMatrix={prescriptionsByMatrix}
                samples={samples}
                regions={region ? [region] : RegionList}
                onChangePrescriptionCount={changePrescriptionCount(
                  programmingPlan.id
                )}
                onChangePrescriptionLaboratory={changePrescriptionLaboratory(
                  programmingPlan.id
                )}
                onRemovePrescriptionByMatrix={removePrescriptionByMatrix}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PrescriptionListView;
