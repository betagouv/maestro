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
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import { PrescriptionSort } from 'shared/schema/Prescription/Prescription';
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
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  useFindPrescriptionsQuery,
} from 'src/services/prescription.service';
import {
  useFindRegionalPrescriptionsQuery,
  useUpdateRegionalPrescriptionMutation,
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
  const [updateRegionalPrescription, { isSuccess: isUpdateSuccess }] =
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
    }),
    [programmingPlan, prescriptionListContext, region]
  );

  const { data: allPrescriptions } = useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !programmingPlan,
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

  const { data: allRegionalPrescriptions } = useFindRegionalPrescriptionsQuery(
    {
      ...findPrescriptionOptions,
      includes: ['comments', 'realizedSampleCount'],
    },
    {
      skip: !programmingPlan,
    }
  );

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

  const addMatrix = async (programmingPlanId: string, matrix: Matrix) => {
    await addPrescription({
      programmingPlanId,
      context: prescriptionListContext,
      matrix,
      stages: [],
    });
  };

  const removePrescription = async (prescriptionId: string) => {
    await deletePrescription({
      programmingPlanId: programmingPlan?.id as string,
      prescriptionId,
    });
  };

  const changeRegionalPrescriptionCount = async (
    regionalPrescriptionId: string,
    count: number
  ) => {
    await updateRegionalPrescription({
      regionalPrescriptionId,
      prescriptionUpdate: {
        programmingPlanId: programmingPlan?.id as string,
        sampleCount: count,
      },
    });
  };

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
        {programmingPlan && prescriptions && allRegionalPrescriptions && (
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
                  sampleCount={_.sumBy(allRegionalPrescriptions, 'sampleCount')}
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
                {prescriptions?.map((prescription) => (
                  <>
                    {hasNationalView ? (
                      <PrescriptionCardNational
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        regionalPrescriptions={allRegionalPrescriptions.filter(
                          (rp) => rp.prescriptionId === prescription.id
                        )}
                        onChangeRegionalPrescriptionCount={
                          changeRegionalPrescriptionCount
                        }
                        onRemovePrescription={removePrescription}
                        key={`prescription_${prescription.matrix}`}
                      />
                    ) : (
                      <PrescriptionCardRegional
                        programmingPlan={programmingPlan}
                        prescription={prescription}
                        key={`prescription_${prescription.matrix}`}
                      />
                    )}
                  </>
                ))}
              </div>
            )}
            {prescriptionListDisplay === 'table' && (
              <PrescriptionTable
                programmingPlan={programmingPlan}
                prescriptions={prescriptions}
                regionalPrescriptions={allRegionalPrescriptions}
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
    </section>
  );
};

export default PrescriptionListView;
