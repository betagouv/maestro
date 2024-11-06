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
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import {
  genPrescriptionByMatrix,
  PrescriptionByMatrix,
} from 'shared/schema/Prescription/PrescriptionsByMatrix';
import {
  Context,
  ContextLabels,
  ContextList,
} from 'shared/schema/ProgrammingPlan/Context';
import { programmingPlanLabel } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import AutoClose from 'src/components/AutoClose/AutoClose';
import PrescriptionCard from 'src/components/PrescriptionCard/PrescriptionCard';
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
  const { programmingPlan } = useAppSelector((state) => state.settings);
  const { prescriptionListDisplay, matrixQuery, prescriptionListContext } =
    useAppSelector((state) => state.prescriptions);

  const [searchParams, setSearchParams] = useSearchParams();
  const { userInfos } = useAuthentication();

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
    dispatch(
      prescriptionsSlice.actions.changeListContext(
        searchParams.get('context') as Context
      )
    );
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
  }, [prescriptions, samples]);

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

  if (!programmingPlan || !prescriptions || !samples) {
    return <></>;
  }

  const addMatrix = async (matrix: Matrix, stages: Stage[]) => {
    await addPrescriptions({
      programmingPlanId: programmingPlan.id,
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

  const changePrescriptionCount = async (
    prescriptionId: string,
    count: number
  ) => {
    await updatePrescription({
      prescriptionId,
      prescriptionUpdate: {
        programmingPlanId: programmingPlan.id,
        context: findPrescriptionOptions.context,
        sampleCount: count,
      },
    });
  };

  const changePrescriptionLaboratory = async (
    prescriptionId: string,
    laboratoryId?: string
  ) => {
    await updatePrescription({
      prescriptionId,
      prescriptionUpdate: {
        programmingPlanId: programmingPlan.id,
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
          title={programmingPlanLabel(programmingPlan)}
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
                className={cx('fr-mr-3w')}
              />
              {/*//TODO: Implement the button to submit the programming plan*/}
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
              addMatrix={addMatrix}
            />
          }
        </div>
        {prescriptionListDisplay === 'cards' && (
          <div className="prescription-cards-container">
            {prescriptionsByMatrix.map((prescriptionByMatrix) => (
              <PrescriptionCard
                programmingPlan={programmingPlan}
                prescriptionByMatrix={prescriptionByMatrix}
                onChangePrescriptionCount={changePrescriptionCount}
                onRemovePrescriptionByMatrix={removePrescriptionByMatrix}
                key={`prescription_${prescriptionByMatrix.matrix}`}
              />
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
            onChangePrescriptionCount={changePrescriptionCount}
            onChangePrescriptionLaboratory={changePrescriptionLaboratory}
            onRemovePrescriptionByMatrix={removePrescriptionByMatrix}
          />
        )}
      </div>
    </section>
  );
};

export default PrescriptionListView;
