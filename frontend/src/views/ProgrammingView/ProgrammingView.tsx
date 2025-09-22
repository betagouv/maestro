import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { isEmpty, mapValues, omitBy, orderBy, uniq, uniqBy } from 'lodash-es';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import programmation from '../../assets/illustrations/programmation.svg';
import AppToast from '../../components/_app/AppToast/AppToast';
import PrescriptionCommentsModal from '../../components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import prescriptionsSlice, {
  PrescriptionFilters
} from '../../store/reducers/prescriptionsSlice';
import ProgrammingCommentList from './ProgrammingCommentList/ProgrammingCommentList';
import ProgrammingPrescriptionFilters from './ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
import ProgrammingPrescriptionList from './ProgrammingPrescriptionList/ProgrammingPrescriptionList';

const ProgrammingView = () => {
  useDocumentTitle('Programmation');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasNationalView } = useAuthentication();
  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({
    status: ProgrammingPlanStatusList.filter((status) => status !== 'Closed')
  });

  const domainOptions = useMemo(
    () =>
      uniq(
        (programmingPlans ?? [])
          .filter((plan) => plan.year === prescriptionFilters.year)
          ?.map((_) => _.domain)
      ),
    [programmingPlans, prescriptionFilters.year]
  );
  const programmingPlanOptions = useCallback(
    (filters: Partial<PrescriptionFilters>) =>
      (programmingPlans ?? []).filter(
        (plan) =>
          plan.year === filters.year &&
          (filters.domain ? plan.domain === filters.domain : true)
      ),
    [programmingPlans]
  );
  const programmingPlanKindOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter((plan) => (filters.planIds ?? [plan.id]).includes(plan.id))
          .flatMap((plan) => plan.kinds)
      ),
    [programmingPlanOptions]
  );
  const contextOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter((plan) => (filters.planIds ?? [plan.id]).includes(plan.id))
          .flatMap((plan) => plan.contexts)
      ),
    [programmingPlanOptions]
  );

  useEffect(() => {
    dispatch(
      prescriptionsSlice.actions.changePrescriptionFilters({
        year: Number(
          searchParams.get('year') ??
            orderBy(programmingPlans, 'year', 'desc')[0]?.year
        ),
        domain:
          (searchParams.get('domain') as ProgrammingPlanDomain) ?? undefined,
        planIds:
          (searchParams.get('planIds')?.split(',') as string[]) ?? undefined,
        kinds:
          (searchParams.get('kinds')?.split(',') as ProgrammingPlanKind[]) ??
          undefined,
        contexts:
          (searchParams
            .get('contexts')
            ?.split(',') as ProgrammingPlanContext[]) ?? undefined,
        matrixKinds:
          (searchParams.get('matrixKinds')?.split(',') as MatrixKind[]) ??
          undefined
      })
    );
  }, [searchParams, programmingPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProgrammingPlans = useMemo(
    () =>
      (programmingPlans ?? [])
        .filter((plan) =>
          prescriptionFilters.year
            ? plan.year === prescriptionFilters.year
            : true
        )
        .filter((plan) =>
          prescriptionFilters.domain
            ? plan.domain === prescriptionFilters.domain
            : true
        )
        .filter((plan) =>
          prescriptionFilters.planIds
            ? prescriptionFilters.planIds.includes(plan.id)
            : true
        ),

    [prescriptionFilters, programmingPlans]
  );

  const region = useMemo(
    () =>
      hasNationalView
        ? ((searchParams.get('region') as Region) ?? undefined)
        : user?.region,
    [hasNationalView, user, searchParams]
  );

  const [commentRegionalPrescription, { isSuccess: isCommentSuccess }] =
    apiClient.useCommentRegionalPrescriptionMutation();

  const changeFilter = (findFilter: Partial<PrescriptionFilters>) => {
    const aggregatedFilters = {
      ...prescriptionFilters,
      ...findFilter
    };

    const { year, domain } = aggregatedFilters;
    const planIds =
      aggregatedFilters?.planIds?.filter((id) =>
        programmingPlanOptions({ year, domain }).some(
          (planOption) => planOption.id === id
        )
      ) ?? undefined;
    const kinds =
      aggregatedFilters?.kinds?.filter((kind) =>
        programmingPlanKindOptions({
          year,
          domain,
          planIds
        }).some((kindOption) => kind === kindOption)
      ) ?? undefined;
    const contexts =
      aggregatedFilters?.contexts?.filter((context) =>
        contextOptions({
          year,
          domain,
          planIds,
          kinds
        }).some((contextOption) => context === contextOption)
      ) ?? undefined;

    const filteredParams = {
      ...aggregatedFilters,
      planIds,
      kinds,
      contexts
    };

    const urlSearchParams = new URLSearchParams(
      omitBy(
        mapValues(filteredParams, (value) => value?.toString()),
        isEmpty
      ) as Record<string, string>
    );

    setSearchParams(urlSearchParams, { replace: true });
  };

  const submitRegionalPrescriptionComment = useCallback(
    async (
      regionalPrescriptionKey: RegionalPrescriptionKey,
      comment: string
    ) => {
      const programmingPlan = programmingPlans?.find(
        (plan) => plan.id === regionalPrescriptionKey.prescriptionId
      );
      if (programmingPlan) {
        await commentRegionalPrescription({
          prescriptionId: regionalPrescriptionKey.prescriptionId,
          region: regionalPrescriptionKey.region,
          commentToCreate: {
            programmingPlanId: programmingPlan.id,
            comment
          }
        });
      }
    },
    [programmingPlans] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <AppToast open={isCommentSuccess} description="Commentaire ajouté" />
      <section className={clsx('main-section')}>
        <div className={cx('fr-container')}>
          <SectionHeader
            title="Programmation"
            subtitle={Regions[region as Region]?.name}
            illustration={programmation}
            action={
              <>
                <SegmentedControl
                  hideLegend
                  legend="Année"
                  segments={
                    orderBy(
                      uniqBy(programmingPlans, 'year'),
                      'year',
                      'desc'
                    ).map(({ year }) => ({
                      label: year,
                      nativeInputProps: {
                        checked: year === prescriptionFilters.year,
                        onChange: () =>
                          changeFilter({
                            year,
                            domain: undefined,
                            planIds: undefined,
                            kinds: undefined,
                            contexts: undefined,
                            matrixKinds: undefined
                          })
                      }
                    })) as any
                  }
                />
                {/*{programmingPlan &&*/}
                {/*  programmingPlan.regionalStatus.some(*/}
                {/*    (regionalStatus) =>*/}
                {/*      NextProgrammingPlanStatus[regionalStatus.status] &&*/}
                {/*      ['Submitted', 'Validated'].includes(*/}
                {/*        NextProgrammingPlanStatus[*/}
                {/*          regionalStatus.status*/}
                {/*        ] as ProgrammingPlanStatus*/}
                {/*      )*/}
                {/*  ) && (*/}
                {/*    <ProgrammingPlanNationalValidation*/}
                {/*      programmingPlan={programmingPlan}*/}
                {/*    />*/}
                {/*  )}*/}
              </>
            }
          />

          {filteredProgrammingPlans && (
            <div
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className="d-flex-align-start">
                <div className={clsx('flex-grow-1')}>
                  <ProgrammingPrescriptionFilters
                    options={{
                      domains: domainOptions,
                      plans: programmingPlanOptions(prescriptionFilters),
                      kinds: programmingPlanKindOptions(prescriptionFilters),
                      contexts: contextOptions(prescriptionFilters)
                    }}
                    programmingPlans={filteredProgrammingPlans}
                    filters={prescriptionFilters}
                    onChange={changeFilter}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {programmingPlans && (
          <div className={cx('fr-container')}>
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {/*{!hasNationalView &&*/}
              {/*  programmingPlan.regionalStatus.some(*/}
              {/*    (regionalStatus) =>*/}
              {/*      regionalStatus.region === region &&*/}
              {/*      ['Submitted', 'Approved'].includes(regionalStatus.status)*/}
              {/*  ) && (*/}
              {/*    <ProgrammingPlanRegionalValidation*/}
              {/*      programmingPlan={programmingPlan}*/}
              {/*      region={region as Region}*/}
              {/*    />*/}
              {/*  )}*/}
              <div className={cx('fr-col-12')}>
                <Tabs
                  classes={{
                    panel: 'white-container'
                  }}
                  tabs={
                    [
                      {
                        label: 'Programmation',
                        content: (
                          <ProgrammingPrescriptionList
                            programmingPlans={filteredProgrammingPlans ?? []}
                            region={region ?? undefined}
                          />
                        )
                      },
                      ...(hasNationalView
                        ? [
                            // {
                            //   label: 'Phase de consultation',
                            //   content: (
                            //     <ProgrammingPlanRegionalValidationList
                            //       programmingPlan={programmingPlan}
                            //       context={prescriptionListContext}
                            //     />
                            //   ),
                            //   iconId: 'fr-icon-chat-check-line'
                            // },
                            {
                              label: 'Commentaires',
                              content: (
                                <ProgrammingCommentList
                                  programmingPlans={
                                    filteredProgrammingPlans ?? []
                                  }
                                />
                              ),
                              iconId: 'fr-icon-chat-3-line'
                            }
                          ]
                        : [])
                    ] as any
                  }
                />
              </div>
            </div>
            <PrescriptionCommentsModal
              onSubmitRegionalPrescriptionComment={
                submitRegionalPrescriptionComment
              }
            />
          </div>
        )}
      </section>
    </>
  );
};

export default ProgrammingView;
