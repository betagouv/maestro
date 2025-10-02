import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { isEmpty, mapValues, omitBy, orderBy, uniqBy } from 'lodash-es';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionKey';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import programmation from '../../assets/illustrations/programmation-white.svg';
import AppToast from '../../components/_app/AppToast/AppToast';
import PrescriptionCommentsModal from '../../components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import ProgrammingPlanNotificationRegionalToNational from '../../components/ProgrammingPlanNotification/ProgrammingPlanNotificationRegionalToNational/ProgrammingPlanNotificationRegionalToNational';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePrescriptionFilters } from '../../hooks/usePrescriptionFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import prescriptionsSlice, {
  PrescriptionFilters
} from '../../store/reducers/prescriptionsSlice';
import ProgrammingCommentList from './ProgrammingCommentList/ProgrammingCommentList';
import ProgrammingPlanRegionalValidationList from './ProgrammingPlanRegionalValidationList/ProgrammingPlanRegionalValidationList';
import ProgrammingPrescriptionFilters from './ProgrammingPrescriptionFilters/ProgrammingPrescriptionFilters';
import ProgrammingPrescriptionList from './ProgrammingPrescriptionList/ProgrammingPrescriptionList';

type ProgrammingViewTab =
  | 'ProgrammationTab'
  | 'ConsultationTab'
  | 'CommentsTab';

const ProgrammingView = () => {
  useDocumentTitle('Programmation');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();

  const [selectedTabId, setSelectedTabId] =
    useState<ProgrammingViewTab>('ProgrammationTab');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasNationalView } = useAuthentication();
  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({
    status: ProgrammingPlanStatusList.filter((status) => status !== 'Closed')
  });
  const [commentRegionalPrescription, { isSuccess: isCommentSuccess }] =
    apiClient.useCommentRegionalPrescriptionMutation();

  const {
    domainOptions,
    programmingPlanOptions,
    programmingPlanKindOptions,
    contextOptions,
    reduceFilters
  } = usePrescriptionFilters(programmingPlans);

  useEffect(() => {
    dispatch(
      prescriptionsSlice.actions.changePrescriptionFilters(
        reduceFilters(prescriptionFilters, {
          year: Number(
            searchParams.get('year') ?? new Date().getFullYear().toString()
          ),
          domain:
            (searchParams.get('domain') as ProgrammingPlanDomain) ?? undefined,
          programmingPlan: programmingPlans?.find(
            (plan) => plan.id === searchParams.get('planId')
          ),
          kinds:
            (searchParams.get('kinds')?.split(',') as ProgrammingPlanKind[]) ??
            undefined,
          context:
            (searchParams.get('context') as ProgrammingPlanContext) ?? undefined
        })
      )
    );
  }, [searchParams, programmingPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  const region = useMemo(
    () =>
      hasNationalView
        ? ((searchParams.get('region') as Region) ?? undefined)
        : user?.region,
    [hasNationalView, user, searchParams]
  );

  const changeFilter = (findFilter: Partial<PrescriptionFilters>) => {
    const filteredParams = reduceFilters(prescriptionFilters, findFilter);

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
      programmingPlan: ProgrammingPlan,
      regionalPrescriptionKey: RegionalPrescriptionKey,
      comment: string
    ) => {
      await commentRegionalPrescription({
        prescriptionId: regionalPrescriptionKey.prescriptionId,
        region: regionalPrescriptionKey.region,
        commentToCreate: {
          programmingPlanId: programmingPlan.id,
          comment
        }
      });
    },
    [commentRegionalPrescription]
  );

  return (
    <>
      <AppToast open={isCommentSuccess} description="Commentaire ajouté" />
      <section className={clsx('main-section')}>
        <div className={clsx('green-container')}>
          <div className={cx('fr-container')}>
            <SectionHeader
              title={
                <>
                  Programmation{' '}
                  {prescriptionFilters.domain &&
                    ProgrammingPlanDomainLabels[
                      prescriptionFilters.domain
                    ].toLowerCase()}
                </>
              }
              subtitle={Regions[region as Region]?.name}
              illustration={programmation}
              action={
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
                            programmingPlan: undefined,
                            kinds: undefined,
                            context: undefined
                          })
                      }
                    })) as any
                  }
                />
              }
            />
            {prescriptionFilters.programmingPlan && (
              <ProgrammingPlanNotificationRegionalToNational
                programmingPlan={prescriptionFilters.programmingPlan}
                region={region as Region}
              />
            )}
            {/*{programmingPlan && (*/}
            {/*  <ProgrammingPlanNotificationRegionalToDepartmental*/}
            {/*    programmingPlan={programmingPlan}*/}
            {/*    region={region as Region}*/}
            {/*  />*/}
            {/*)}*/}
            <div
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className="d-flex-align-start">
                <div className={clsx('flex-grow-1')}>
                  <ProgrammingPrescriptionFilters
                    options={{
                      domains: domainOptions(prescriptionFilters),
                      plans: programmingPlanOptions(prescriptionFilters),
                      kinds: programmingPlanKindOptions(prescriptionFilters),
                      contexts: contextOptions(prescriptionFilters)
                    }}
                    filters={prescriptionFilters}
                    onChange={changeFilter}
                    renderMode="inline"
                    multiSelect
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('fr-container')}>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <Tabs
                selectedTabId={selectedTabId}
                onTabChange={(tabId) =>
                  setSelectedTabId(tabId as ProgrammingViewTab)
                }
                classes={{
                  panel: 'white-container'
                }}
                tabs={
                  [
                    {
                      label: 'Programmation',
                      tabId: 'ProgrammationTab',
                      iconId: 'fr-icon-survey-line'
                    },
                    ...(hasNationalView
                      ? [
                          {
                            label: 'Phase de consultation',
                            tabId: 'ConsultationTab',
                            iconId: 'fr-icon-chat-check-line'
                          },
                          {
                            label: 'Commentaires',
                            tabId: 'CommentsTab',
                            iconId: 'fr-icon-chat-3-line'
                          }
                        ]
                      : [])
                  ] as any
                }
              >
                {prescriptionFilters.programmingPlan ? (
                  <>
                    {selectedTabId === 'ProgrammationTab' && (
                      <ProgrammingPrescriptionList
                        programmingPlan={prescriptionFilters.programmingPlan}
                        region={region ?? undefined}
                      />
                    )}
                    {selectedTabId === 'ConsultationTab' && (
                      <ProgrammingPlanRegionalValidationList
                        programmingPlan={prescriptionFilters.programmingPlan}
                      />
                    )}
                    {selectedTabId === 'CommentsTab' && (
                      <ProgrammingCommentList
                        programmingPlan={prescriptionFilters.programmingPlan}
                      />
                    )}
                  </>
                ) : (
                  'Veuillez sélectionner un plan de programmation'
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </section>
      <PrescriptionCommentsModal
        onSubmitRegionalPrescriptionComment={submitRegionalPrescriptionComment}
      />
    </>
  );
};

export default ProgrammingView;
