import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs, { type TabsProps } from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { isEmpty, mapValues, max, omitBy } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
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
import UnsavedChangesModal, {
  openUnsavedChangesModal
} from '../../components/UnsavedChangesModal/UnsavedChangesModal';
import YearSelector from '../../components/YearSelector/YearSelector';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePrescriptionFilters } from '../../hooks/usePrescriptionFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { ApiClientContext } from '../../services/apiClient';
import prescriptionsSlice, {
  type PrescriptionFilters
} from '../../store/reducers/prescriptionsSlice';
import ProgrammingCommentList from './ProgrammingCommentList/ProgrammingCommentList';
import ProgrammingPlanRegionalValidationList from './ProgrammingPlanRegionalValidationList/ProgrammingPlanRegionalValidationList';
import ProgrammingPlanTrackingTable from './ProgrammingPlanTrackingTable/ProgrammingPlanTrackingTable';
import ProgrammingPrescriptionList from './ProgrammingPrescriptionList/ProgrammingPrescriptionList';
import './ProgrammingView.scss';

type ProgrammingViewTab =
  | 'ProgrammationTab'
  | 'ConsultationTab'
  | 'CommentsTab'
  | 'PlanTrackingTab';

const ProgrammingView = () => {
  useDocumentTitle('Programmation');
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { year } = useParams<{ year: string }>();

  const [selectedTabId, setSelectedTabId] =
    useState<ProgrammingViewTab>('ProgrammationTab');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasNationalView, hasRegionalView, hasRole, hasUserPermission } =
    useAuthentication();
  const { prescriptionFilters, prescriptionListDisplay } = useAppSelector(
    (state) => state.prescriptions
  );

  const [listHasPendingChanges, setListHasPendingChanges] = useState(false);
  const listResetFnRef = useRef<() => void>(() => {});
  const pendingTabIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (listHasPendingChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [listHasPendingChanges]);

  const handleUnsavedConfirm = useCallback(() => {
    listResetFnRef.current();
    setListHasPendingChanges(false); // reset immediately — list may be unmounting so its useEffect won't fire
    if (pendingTabIdRef.current) {
      setSelectedTabId(pendingTabIdRef.current as ProgrammingViewTab);
      pendingTabIdRef.current = null;
    }
  }, []);

  const handleUnsavedCancel = useCallback(() => {
    pendingTabIdRef.current = null;
  }, []);

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (listHasPendingChanges) {
        pendingTabIdRef.current = tabId;
        openUnsavedChangesModal();
      } else {
        setSelectedTabId(tabId as ProgrammingViewTab);
      }
    },
    [listHasPendingChanges]
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
              ?.split(',') as ProgrammingPlanContext[]) ?? undefined
        })
      )
    );
  }, [searchParams, programmingPlans]);

  const filteredProgrammingPlans = useMemo(
    () =>
      (programmingPlans ?? []).filter(
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

  const rawTabs: (TabsProps.Controlled['tabs'][number] | undefined)[] = [
    {
      label: 'Tous les sous-plans',
      tabId: 'ProgrammationTab',
      iconId: 'fr-icon-survey-line'
    },
    filteredProgrammingPlans.some(
      (p) => p.distributionKind === 'SLAUGHTERHOUSE'
    ) && hasUserPermission('manageProgrammingPlan')
      ? {
          label: 'Statut par région',
          tabId: 'ConsultationTab',
          iconId: 'fr-icon-chat-check-line'
        }
      : undefined,
    filteredProgrammingPlans.some((p) => p.distributionKind === 'REGIONAL') &&
    hasUserPermission('commentPrescription')
      ? {
          label: 'Commentaires',
          tabId: 'CommentsTab',
          iconId: 'fr-icon-chat-3-line'
        }
      : undefined,
    hasRole('Administrator', 'NationalCoordinator', 'RegionalCoordinator')
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
                    className={clsx({
                      'full-width':
                        (hasNationalView || hasRegionalView) &&
                        prescriptionListDisplay === 'table',
                      'push-last-tab-right': hasRole(
                        'Administrator',
                        'NationalCoordinator',
                        'RegionalCoordinator'
                      )
                    })}
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
                            />
                          )}
                        {selectedTabId === 'ConsultationTab' &&
                          hasNationalView &&
                          filteredProgrammingPlans.map((plan) => (
                            <ProgrammingPlanRegionalValidationList
                              key={plan.id}
                              programmingPlan={plan}
                            />
                          ))}
                        {selectedTabId === 'CommentsTab' &&
                          filteredProgrammingPlans.map((plan) => (
                            <ProgrammingCommentList
                              key={plan.id}
                              programmingPlan={plan}
                            />
                          ))}
                        {selectedTabId === 'PlanTrackingTab' &&
                          hasRole(
                            'Administrator',
                            'NationalCoordinator',
                            'RegionalCoordinator'
                          ) && (
                            <ProgrammingPlanTrackingTable
                              programmingPlans={filteredProgrammingPlans.filter(
                                (plan) => plan.year === prescriptionFilters.year
                              )}
                              region={
                                hasRegionalView ? (region as Region) : undefined
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
      <UnsavedChangesModal
        onConfirm={handleUnsavedConfirm}
        onCancel={handleUnsavedCancel}
      />
      <PrescriptionCommentsModal
        onSubmitLocalPrescriptionComment={submitLocalPrescriptionComment}
      />
    </>
  );
};

export default ProgrammingView;
