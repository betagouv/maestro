import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Notice from '@codegouvfr/react-dsfr/Notice';
import Tabs, { type TabsProps } from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { isEmpty, isNil, mapValues, max, omitBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import type { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import type { Stage } from 'maestro-shared/referential/Stage';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanStatusList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { isDefined } from 'maestro-shared/utils/utils';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useParams, useSearchParams } from 'react-router';
import programmation from '../../assets/illustrations/programmation.svg';
import AppToast from '../../components/_app/AppToast/AppToast';
import PrescriptionCommentsModal from '../../components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import UnsavedChangesGuard, {
  useUnsavedChangesGuard
} from '../../components/UnsavedChangesGuard/UnsavedChangesGuard';
import YearSelector from '../../components/YearSelector/YearSelector';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePrescriptionFilters } from '../../hooks/usePrescriptionFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import prescriptionsSlice, {
  type PrescriptionFilters
} from '../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../utils/stringUtils';
import ProgrammingCommentList from './ProgrammingCommentList/ProgrammingCommentList';
import ProgrammingPlanTrackingTable from './ProgrammingPlanTrackingTable/ProgrammingPlanTrackingTable';
import { useProgrammingPlanTrackingStatus } from './ProgrammingPlanTrackingTable/useProgrammingPlanTrackingStatus';
import ProgrammingPrescriptionList from './ProgrammingPrescriptionList/ProgrammingPrescriptionList';
import './ProgrammingView.scss';

type ProgrammingViewTab =
  | 'ProgrammationTab'
  | 'CommentsTab'
  | 'PlanTrackingTab';

const ProgrammingView = () => {
  useDocumentTitle('Programmation');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { year } = useParams<{ year: string }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTabId, setSelectedTabId] = useState<ProgrammingViewTab>(() => {
    const tab = searchParams.get('tab');
    return tab === 'CommentsTab' ||
      tab === 'PlanTrackingTab' ||
      tab === 'ProgrammationTab'
      ? tab
      : 'ProgrammationTab';
  });
  const {
    user,
    hasNationalView,
    hasRegionalView,
    hasDepartmentalView,
    hasRole,
    hasUserPermission
  } = useAuthentication();
  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );

  const [listHasPendingChanges, setListHasPendingChanges] = useState(false);
  const listResetFnRef = useRef<() => void>(() => {});
  const hasMarkedChangesViewedRef = useRef(false);
  const [markLocalPrescriptionChangesViewed] =
    apiClient.useMarkLocalPrescriptionChangesViewedMutation();

  const unsavedChangesGuard = useUnsavedChangesGuard({
    when: listHasPendingChanges,
    onDiscard: useCallback(() => {
      listResetFnRef.current();
      setListHasPendingChanges(false); // reset immediately — list may be unmounting so its useEffect won't fire
    }, [])
  });

  const handleTabChange = useCallback(
    (tabId: string) =>
      unsavedChangesGuard.run(() =>
        setSelectedTabId(tabId as ProgrammingViewTab)
      ),
    [unsavedChangesGuard]
  );

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({
    status: year
      ? ['Closed']
      : ProgrammingPlanStatusList.filter((status) => status !== 'Closed'),
    year: year ? Number(year) : undefined
  });
  const [commentLocalPrescription, { isSuccess: isCommentSuccess }] =
    apiClient.useCommentLocalPrescriptionMutation();

  const { yearOptions, reduceFilters } =
    usePrescriptionFilters(programmingPlans);

  useEffect(() => {
    dispatch(
      prescriptionsSlice.actions.changePrescriptionFilters(
        reduceFilters(prescriptionFilters, {
          year: Number(
            searchParams.get('year') ??
              max(programmingPlans?.map((plan) => plan.year))
          ),
          programmingPlanIds:
            (searchParams.get('programmingPlanIds')?.split(',') as string[]) ??
            undefined,
          programmingSubPlanIds:
            (searchParams
              .get('programmingSubPlanIds')
              ?.split(',') as ProgrammingSubPlanId[]) ?? undefined,
          contexts:
            (searchParams
              .get('contexts')
              ?.split(',') as ProgrammingPlanContext[]) ?? undefined,
          programmingPlanDomainIds:
            (searchParams
              .get('programmingPlanDomainIds')
              ?.split(',') as ProgrammingPlanDomainId[]) ?? undefined,
          matrices:
            (searchParams.get('matrices')?.split(',') as Matrix[]) ?? undefined,
          coordinatorIds:
            searchParams.get('coordinatorIds')?.split(',') ?? undefined,
          laboratoryIds:
            searchParams.get('laboratoryIds')?.split(',') ?? undefined,
          outsideProgrammingPlan:
            searchParams.get('outsideProgrammingPlan') === 'true'
              ? true
              : undefined,
          stage: (searchParams.get('stage') as Stage) ?? undefined
        })
      )
    );
  }, [searchParams, programmingPlans]);

  const filteredProgrammingPlans = useMemo(
    () =>
      (programmingPlans ?? [])
        .filter(
          (plan) =>
            !prescriptionFilters.year || plan.year === prescriptionFilters.year
        )
        .filter(
          (plan) =>
            !prescriptionFilters.programmingPlanIds?.length ||
            prescriptionFilters.programmingPlanIds.includes(plan.id)
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
      programmingPlan: ProgrammingPlanChecked,
      regionalPrescriptionKey: LocalPrescriptionKey,
      comment: string
    ) => {
      await commentLocalPrescription({
        prescriptionId: regionalPrescriptionKey.prescriptionId,
        region: regionalPrescriptionKey.region,
        programmingPlanId: programmingPlan.id,
        comment
      });
    },
    [commentLocalPrescription]
  );

  const yearProgrammingPlans = useMemo(
    () =>
      (programmingPlans ?? []).filter(
        (plan) => plan.year === prescriptionFilters.year
      ),
    [programmingPlans, prescriptionFilters.year]
  );

  const { readyToSendPlans } = useProgrammingPlanTrackingStatus(
    yearProgrammingPlans,
    region ?? undefined,
    user?.department ?? undefined
  );

  const readyToSendSubtitle = useMemo(() => {
    const count = readyToSendPlans.length;
    if (!count) {
      return undefined;
    }
    const plural = `${count} ${pluralize(count)('plan')} ${count > 1 ? 'sont prêts' : 'est prêt'}`;
    const diffused = pluralize(count)('diffusé');

    if (hasRole('AdministratorBGIR')) {
      return `${plural} à être soumis aux régions.`;
    }
    if (hasRole('NationalCoordinator')) {
      return `${plural} à être soumis à l'administrateur et/ou aux régions.`;
    }
    if (hasRole('RegionalCoordinator')) {
      const hasSlaughterhouse = readyToSendPlans.some(
        (plan) => plan.distributionKind === 'SLAUGHTERHOUSE'
      );
      const hasRegional = readyToSendPlans.some(
        (plan) => plan.distributionKind !== 'SLAUGHTERHOUSE'
      );
      if (hasSlaughterhouse && hasRegional) {
        return `${plural} à être soumis aux départements et/ou ${diffused} aux préleveurs.`;
      }
      return hasSlaughterhouse
        ? `${plural} à être soumis aux départements.`
        : `${plural} à être ${diffused} aux préleveurs.`;
    }
    if (hasRole('DepartmentalCoordinator')) {
      const awaitsLaunch = readyToSendPlans.some((plan) =>
        isNil(plan.launchedAt)
      );
      return awaitsLaunch
        ? `${plural} à être ${diffused} aux préleveurs. ${pluralize(count, {
            replacements: [{ old: 'sera', new: 'seront' }]
          })(
            'Il sera visible'
          )} des préleveurs dès le lancement de la campagne par le BGIR.`
        : `${plural} à être ${diffused} aux préleveurs.`;
    }
    return undefined;
  }, [readyToSendPlans, hasRole]);

  const rawTabs: (TabsProps.Controlled['tabs'][number] | undefined)[] = [
    {
      label: 'Tous les sous-plans',
      tabId: 'ProgrammationTab',
      iconId: 'fr-icon-survey-line'
    },
    (programmingPlans ?? []).some((p) => p.distributionKind === 'REGIONAL') &&
    hasUserPermission('commentPrescription')
      ? {
          label: 'Commentaires',
          tabId: 'CommentsTab',
          iconId: 'fr-icon-chat-3-line'
        }
      : undefined,
    hasRole(
      'AdministratorBGIR',
      'NationalCoordinator',
      'RegionalCoordinator',
      'DepartmentalCoordinator'
    )
      ? {
          label: 'Suivi des plans',
          tabId: 'PlanTrackingTab',
          iconId: 'fr-icon-chat-check-line'
        }
      : undefined
  ];
  const tabs = rawTabs.filter(isDefined);

  return (
    <>
      <AppToast open={isCommentSuccess} description="Commentaire ajouté" />
      <section className={clsx('main-section')}>
        <div className={cx('fr-container')}>
          <SectionHeader
            title={
              <div className="d-flex-align-center">
                Programmation{' '}
                {yearOptions.length <= 1 ? (
                  prescriptionFilters.year
                ) : (
                  <YearSelector
                    year={prescriptionFilters.year ?? 0}
                    years={yearOptions}
                    onChange={(year) => changeFilter({ year })}
                  />
                )}
              </div>
            }
            subtitle={`${region ? Regions[region]?.name : ''}${user?.department ? ` - ${DepartmentLabels[user?.department]}` : ''}`}
            illustration={programmation}
          />
        </div>
        {programmingPlans && (
          <div className={cx('fr-container')}>
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              <div className={cx('fr-col-12')}>
                {readyToSendSubtitle && (
                  <div className="ready-to-send-notice">
                    <Notice
                      title="Plans à envoyer"
                      description={readyToSendSubtitle}
                      link={{
                        linkProps: {
                          to: '',
                          target: undefined,
                          rel: undefined,
                          onClick: (event) => {
                            event.preventDefault();
                            handleTabChange('PlanTrackingTab');
                          }
                        },
                        text: 'Voir le suivi des plans'
                      }}
                    />
                  </div>
                )}
                {!programmingPlans.length ? (
                  <Alert
                    description={
                      <>
                        La programmation sera disponible une fois que{' '}
                        <b>votre coordinateur aura effectué la répartition.</b>
                      </>
                    }
                    severity="info"
                    title=""
                  />
                ) : (
                  <Tabs
                    selectedTabId={selectedTabId}
                    onTabChange={handleTabChange}
                    className={clsx(
                      {
                        'full-width': !(
                          hasDepartmentalView &&
                          selectedTabId === 'PlanTrackingTab'
                        )
                      },
                      {
                        'push-tabs-right': hasRole(
                          'AdministratorBGIR',
                          'NationalCoordinator',
                          'RegionalCoordinator',
                          'DepartmentalCoordinator'
                        )
                      }
                    )}
                    classes={{
                      panel: clsx('white-container')
                    }}
                    tabs={tabs}
                  >
                    {filteredProgrammingPlans.length ? (
                      <>
                        {selectedTabId === 'ProgrammationTab' &&
                          filteredProgrammingPlans.length > 0 && (
                            <ProgrammingPrescriptionList
                              programmingPlans={filteredProgrammingPlans}
                              region={region ?? undefined}
                              department={user?.department ?? undefined}
                              companies={user?.companies ?? undefined}
                              onPendingChange={(hasPending, reset) => {
                                setListHasPendingChanges(hasPending);
                                listResetFnRef.current = reset;
                              }}
                              onChangeDismissalCandidatesChange={(
                                prescriptionIds
                              ) => {
                                if (
                                  region &&
                                  prescriptionIds.length &&
                                  !hasMarkedChangesViewedRef.current
                                ) {
                                  hasMarkedChangesViewedRef.current = true;
                                  markLocalPrescriptionChangesViewed({
                                    region,
                                    department: user?.department ?? undefined,
                                    prescriptionIds
                                  });
                                }
                              }}
                            />
                          )}
                        {selectedTabId === 'CommentsTab' &&
                          filteredProgrammingPlans.map((plan) => (
                            <ProgrammingCommentList
                              key={plan.id}
                              programmingPlan={plan}
                            />
                          ))}
                        {selectedTabId === 'PlanTrackingTab' &&
                          hasRole(
                            'AdministratorBGIR',
                            'NationalCoordinator',
                            'RegionalCoordinator',
                            'DepartmentalCoordinator'
                          ) && (
                            <ProgrammingPlanTrackingTable
                              programmingPlans={filteredProgrammingPlans.filter(
                                (plan) => plan.year === prescriptionFilters.year
                              )}
                              region={
                                hasRegionalView || hasDepartmentalView
                                  ? (region as Region)
                                  : undefined
                              }
                              department={
                                hasDepartmentalView
                                  ? (user?.department ?? undefined)
                                  : undefined
                              }
                            />
                          )}
                      </>
                    ) : (
                      'Veuillez sélectionner un plan de programmation'
                    )}
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <UnsavedChangesGuard guard={unsavedChangesGuard} />
      <PrescriptionCommentsModal
        onSubmitLocalPrescriptionComment={submitLocalPrescriptionComment}
      />
    </>
  );
};

export default ProgrammingView;
