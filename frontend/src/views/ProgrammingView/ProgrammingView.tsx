import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import {
  isEmpty,
  mapValues,
  omitBy,
  orderBy,
  pick,
  sortBy,
  uniqBy
} from 'lodash-es';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import programmation from '../../assets/illustrations/programmation.svg';
import AppToast from '../../components/_app/AppToast/AppToast';
import FiltersTags from '../../components/FilterTags/FiltersTags';
import PrescriptionCommentsModal from '../../components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import prescriptionsSlice, {
  PrescriptionFilters
} from '../../store/reducers/prescriptionsSlice';
import PrescriptionPrimaryFilters from './PrescriptionFilters/PrescriptionPrimaryFilters';
import PrescriptionSecondaryFilters from './PrescriptionFilters/PrescriptionSecondaryFilters';
import PrescriptionList from './PrescriptionList/PrescriptionList';

const ProgrammingView = () => {
  useDocumentTitle('Programmation');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasNationalView } = useAuthentication();
  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({
    status: ProgrammingPlanStatusList.filter((status) => status !== 'Closed')
  });

  useEffect(() => {
    dispatch(
      prescriptionsSlice.actions.changePrescriptionFilters({
        year: Number(
          searchParams.get('year') ?? sortBy(programmingPlans, 'year')[0]?.year
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
    const filteredParams = omitBy(
      {
        ...mapValues(prescriptionFilters, (value) => value?.toString()),
        ...mapValues(findFilter, (value) => value?.toString())
      },
      isEmpty
    );

    const urlSearchParams = new URLSearchParams(
      filteredParams as Record<string, string>
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
                {uniqBy(programmingPlans, 'year').length > 1 && (
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
                )}
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
                  <PrescriptionPrimaryFilters
                    programmingPlans={(programmingPlans ?? []).filter(
                      (plan) => plan.year === prescriptionFilters.year
                    )}
                    filters={prescriptionFilters}
                    onChange={changeFilter}
                  />
                  {isFilterExpanded && (
                    <PrescriptionSecondaryFilters
                      programmingPlans={(programmingPlans ?? []).filter(
                        (plan) => plan.year === prescriptionFilters.year
                      )}
                      filters={prescriptionFilters}
                      onChange={changeFilter}
                    />
                  )}
                  <div className="d-flex-align-start" style={{ gap: '24px' }}>
                    <FiltersTags
                      key="domain-tags"
                      title="Domaine"
                      filters={pick(prescriptionFilters, ['domain'])}
                      onChange={changeFilter}
                    />
                    <FiltersTags
                      title="Plans"
                      filters={pick(prescriptionFilters, ['planIds'])}
                      onChange={changeFilter}
                      programmingPlans={programmingPlans}
                    />
                    <FiltersTags
                      title="Sous plan"
                      filters={pick(prescriptionFilters, ['kinds'])}
                      onChange={changeFilter}
                    />
                    <FiltersTags
                      title="Contextes"
                      filters={pick(prescriptionFilters, ['contexts'])}
                      onChange={changeFilter}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  priority="secondary"
                  className={cx('fr-ml-3w', 'fr-mt-4w')}
                  style={{ minWidth: '140px', justifyContent: 'center' }}
                >
                  {isFilterExpanded ? 'Fermer' : 'Plus de filtres'}
                </Button>
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
                          <PrescriptionList
                            programmingPlans={filteredProgrammingPlans ?? []}
                            region={region ?? undefined}
                          />
                        )
                      }
                      // ...(hasNationalView
                      //   ? [
                      //       {
                      //         label: 'Phase de consultation',
                      //         content: (
                      //           <ProgrammingPlanRegionalValidationList
                      //             programmingPlan={programmingPlan}
                      //             context={prescriptionListContext}
                      //           />
                      //         ),
                      //         iconId: 'fr-icon-chat-check-line'
                      //       },
                      //       {
                      //         label: 'Commentaires',
                      //         content: (
                      //           <ProgrammingPlanCommentList
                      //             programmingPlan={programmingPlan}
                      //             context={prescriptionListContext}
                      //           />
                      //         ),
                      //         iconId: 'fr-icon-chat-3-line'
                      //       }
                      //     ]
                      //   : [])
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
