import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';

const DashboardView = () => {
  useDocumentTitle('Tableau de bord');
  // const apiClient = useContext(ApiClientContext);
  // const { hasUserPermission, user, hasNationalView } = useAuthentication();
  // const { isOnline } = useOnLine();
  //
  // const { data: programmingPlan, isLoading: isProgrammingPlanLoading } =
  //   apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear());
  // const { data: previousProgrammingPlan } =
  //   apiClient.useGetProgrammingPlanByYearQuery(new Date().getFullYear() - 1, {
  //     skip:
  //       !hasUserPermission('manageProgrammingPlan') &&
  //       (isProgrammingPlanLoading || programmingPlan !== undefined)
  //   });
  // const { data: notice } = apiClient.useGetDashboardNoticeQuery();
  //
  // const currentProgrammingPlan = useMemo(
  //   () => programmingPlan ?? previousProgrammingPlan,
  //   [programmingPlan, previousProgrammingPlan]
  // );
  //
  // const { data: nextProgrammingPlans } = apiClient.useFindProgrammingPlansQuery(
  //   {
  //     status: ['InProgress', 'SubmittedToRegion']
  //   },
  //   {
  //     skip: !hasUserPermission('manageProgrammingPlan')
  //   }
  // );
  // const nextProgrammingPlan = useMemo(
  //   () => nextProgrammingPlans?.[0],
  //   [nextProgrammingPlans]
  // );
  //
  // if (!user || !currentProgrammingPlan) {
  //   return <></>;
  // }

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      {/*<SectionHeader*/}
      {/*  title="Tableau de bord"*/}
      {/*  subtitle="Un rapide coup d’oeil sur votre activité"*/}
      {/*  illustration={dashboard}*/}
      {/*  action={*/}
      {/*    hasUserPermission('createSample') && (*/}
      {/*      <Button*/}
      {/*        size="large"*/}
      {/*        linkProps={{*/}
      {/*          to: AuthenticatedAppRoutes.NewSampleRoute.link(*/}
      {/*            currentProgrammingPlan.year*/}
      {/*          ),*/}
      {/*          target: '_self'*/}
      {/*        }}*/}
      {/*        iconId="fr-icon-microscope-line"*/}
      {/*      >*/}
      {/*        Saisir un prélèvement*/}
      {/*      </Button>*/}
      {/*    )*/}
      {/*  }*/}
      {/*/>*/}
      {/*{isOnline && (*/}
      {/*  <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>*/}
      {/*    {notice?.description && (*/}
      {/*      <DashboardNotice*/}
      {/*        description={notice.description}*/}
      {/*        className={clsx(cx('fr-col-12', 'fr-col-sm-6'), 'd-flex-column')}*/}
      {/*      />*/}
      {/*    )}*/}

      {/*    <DashboardPriorityActions*/}
      {/*      className={clsx(cx('fr-col-12', 'fr-col-sm-6'))}*/}
      {/*      currentProgrammingPlan={currentProgrammingPlan}*/}
      {/*      previousProgrammingPlan={previousProgrammingPlan}*/}
      {/*      nextProgrammingPlan={nextProgrammingPlan}*/}
      {/*    />*/}

      {/*    {hasNationalView &&*/}
      {/*      currentProgrammingPlan.contexts.map((context) => (*/}
      {/*        <div*/}
      {/*          className={cx('fr-col-12', 'fr-col-md-6')}*/}
      {/*          key={`${currentProgrammingPlan.id}-${context}`}*/}
      {/*        >*/}
      {/*          <ProgrammingPlanCard*/}
      {/*            programmingPlan={currentProgrammingPlan}*/}
      {/*            context={context}*/}
      {/*          />*/}
      {/*        </div>*/}
      {/*      ))}*/}

      {/*    {currentProgrammingPlan && (*/}
      {/*      <DashboardPrescriptions*/}
      {/*        programmingPlan={currentProgrammingPlan}*/}
      {/*        className={clsx(cx('fr-col-12'))}*/}
      {/*      />*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*)}*/}
    </section>
  );
};

export default DashboardView;
