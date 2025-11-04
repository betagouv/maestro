import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { isEmpty, mapValues, max, omitBy } from 'lodash-es';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
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
import ProgrammingPlanDepartmentalValidationList from './ProgrammingPlanDepartmentalValidationList/ProgrammingPlanDepartmentalValidationList';
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
  const { user, hasNationalView, hasRegionalView } = useAuthentication();
  const { prescriptionFilters, prescriptionListDisplay } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({
    status: ProgrammingPlanStatusList.filter((status) => status !== 'Closed')
  });
  const [commentLocalPrescription, { isSuccess: isCommentSuccess }] =
    apiClient.useCommentLocalPrescriptionMutation();

  const {
    yearOptions,
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
            searchParams.get('year') ??
              max(programmingPlans?.map((plan) => plan.year))
          ),
          programmingPlanId: searchParams.get('programmingPlanId'),
          kinds:
            (searchParams.get('kinds')?.split(',') as ProgrammingPlanKind[]) ??
            undefined,
          context:
            (searchParams.get('context') as ProgrammingPlanContext) ?? undefined
        })
      )
    );
  }, [searchParams, programmingPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  const programmingPlan = useMemo(
    () =>
      (programmingPlans ?? []).find(
        (plan) => prescriptionFilters.programmingPlanId === plan.id
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

  const submitLocalPrescriptionComment = useCallback(
    async (
      programmingPlan: ProgrammingPlan,
      regionalPrescriptionKey: LocalPrescriptionKey,
      comment: string
    ) => {
      await commentLocalPrescription({
        prescriptionId: regionalPrescriptionKey.prescriptionId,
        region: regionalPrescriptionKey.region,
        commentToCreate: {
          programmingPlanId: programmingPlan.id,
          comment
        }
      });
    },
    [commentLocalPrescription]
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
                    yearOptions(prescriptionFilters).map((year) => ({
                      label: year,
                      nativeInputProps: {
                        checked: year === prescriptionFilters.year,
                        onChange: () =>
                          changeFilter({
                            year
                          })
                      }
                    })) as any
                  }
                />
              }
            />
            {programmingPlan && (
              <ProgrammingPlanNotificationRegionalToNational
                programmingPlan={programmingPlan}
                region={region as Region}
              />
            )}
            <div
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className="d-flex-align-start">
                <div className={clsx('flex-grow-1')}>
                  <ProgrammingPrescriptionFilters
                    options={{
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
                className={clsx({
                  'full-width': prescriptionListDisplay === 'table'
                })}
                classes={{
                  panel: clsx('white-container')
                }}
                tabs={
                  [
                    {
                      label: 'Programmation',
                      tabId: 'ProgrammationTab',
                      iconId: 'fr-icon-survey-line'
                    },
                    ...(hasNationalView ||
                    (hasRegionalView &&
                      programmingPlan?.distributionKind !== 'REGIONAL')
                      ? [
                          {
                            label: 'Phase de consultation',
                            tabId: 'ConsultationTab',
                            iconId: 'fr-icon-chat-check-line'
                          }
                        ]
                      : []),
                    ...(hasNationalView || hasRegionalView
                      ? [
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
                {programmingPlan ? (
                  <>
                    {selectedTabId === 'ProgrammationTab' && (
                      <ProgrammingPrescriptionList
                        programmingPlan={programmingPlan}
                        region={region ?? undefined}
                        department={user?.department ?? undefined}
                        companySiret={user?.company?.siret ?? undefined}
                      />
                    )}
                    {selectedTabId === 'ConsultationTab' && hasNationalView && (
                      <ProgrammingPlanRegionalValidationList
                        programmingPlan={programmingPlan}
                      />
                    )}
                    {selectedTabId === 'ConsultationTab' && hasRegionalView && (
                      <ProgrammingPlanDepartmentalValidationList
                        programmingPlan={programmingPlan}
                        region={region as Region}
                      />
                    )}
                    {selectedTabId === 'CommentsTab' && (
                      <ProgrammingCommentList
                        programmingPlan={programmingPlan}
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
        onSubmitLocalPrescriptionComment={submitLocalPrescriptionComment}
      />
    </>
  );
};

export default ProgrammingView;
