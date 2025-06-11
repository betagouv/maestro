import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Badge } from '@mui/material';
import { Brand } from 'maestro-shared/constants';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useContext } from 'react';
import { useLocation } from 'react-router';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import { useLogoutMutation } from 'src/services/auth.service';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import logo from '../../assets/logo.svg';
import useWindowSize from '../../hooks/useWindowSize';
import { ApiClientContext } from '../../services/apiClient';
import config from '../../utils/config';
import { MascaradeButton } from '../Mascarade/MascaradeButton';
import { MascaradeModal } from '../Mascarade/MascaradeModal';

const mascaradeModal = createModal({
  id: `mascarade-modale-id`,
  isOpenedByDefault: false
});

const Header = () => {
  const location = useLocation();
  const { isMobile } = useWindowSize();
  const apiClient = useContext(ApiClientContext);

  const { isAuthenticated, hasUserPermission, user } = useAuthentication();

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery(
    {},
    { skip: !isAuthenticated }
  );
  const { data: unReadNotifications } = apiClient.useFindNotificationsQuery(
    {
      recipientId: user?.id as string,
      read: false
    },
    {
      skip: !isAuthenticated || !user
    }
  );
  const [logout] = useLogoutMutation();

  const validatedProgrammingPlans = programmingPlans?.filter((pp) =>
    pp.regionalStatus.some((rs) => rs.status === 'Validated')
  );

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const isActive = (path: string, strictPath = false) =>
    strictPath
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <>
      <DSFRHeader
        brandTop={
          <>
            Ministère
            <br />
            de l'Agriculture
            <br />
            et de la Souveraineté
            <br />
            alimentaire
          </>
        }
        homeLinkProps={{
          to: AuthenticatedAppRoutes.DashboardRoute.link,
          title: 'Accueil'
        }}
        id="header"
        operatorLogo={{
          alt: `Logo ${Brand}`,
          imgUrl: logo,
          orientation: 'horizontal'
        }}
        navigation={(isAuthenticated
          ? [
              {
                linkProps: {
                  to: AuthenticatedAppRoutes.DashboardRoute.link,
                  target: '_self'
                },
                text: 'Tableau de bord',
                isActive:
                  location.pathname ===
                    AuthenticatedAppRoutes.DashboardRoute.link ||
                  location.pathname.startsWith('/plans')
              },
              hasUserPermission('readSamples') &&
              validatedProgrammingPlans?.length
                ? {
                    isActive:
                      validatedProgrammingPlans?.some((programmingPlan) =>
                        isActive(
                          `/programmation/${programmingPlan.year}/prelevements`
                        )
                      ) || isActive('/prelevements'),
                    ...(validatedProgrammingPlans?.length === 1
                      ? {
                          text: 'Prélèvements',
                          linkProps: {
                            to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                              validatedProgrammingPlans[0].year
                            ),
                            target: '_self'
                          }
                        }
                      : {
                          text: `Prélèvements ${
                            isActive('/prelevements') && programmingPlan
                              ? programmingPlan.year
                              : ''
                          }`,
                          menuLinks: (validatedProgrammingPlans ?? []).map(
                            (pp) => ({
                              linkProps: {
                                to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                                  pp.year
                                ),
                                target: '_self'
                              },
                              text: pp.year,
                              isActive:
                                isActive('/prelevements') &&
                                pp.id === programmingPlan?.id
                            })
                          )
                        })
                  }
                : undefined,
              validatedProgrammingPlans?.length
                ? {
                    isActive: programmingPlans?.some((programmingPlan) =>
                      isActive(`/programmation/${programmingPlan.year}`, true)
                    ),
                    ...(programmingPlans?.length === 1
                      ? {
                          text: 'Programmation',
                          linkProps: {
                            to: AuthenticatedAppRoutes.ProgrammationByYearRoute.link(
                              programmingPlans[0].year
                            ),
                            target: '_self'
                          }
                        }
                      : {
                          text: `Programmation ${
                            isActive('/programmation') && programmingPlan
                              ? programmingPlan.year
                              : ''
                          }`,
                          menuLinks: (programmingPlans ?? []).map((pp) => ({
                            linkProps: {
                              to: AuthenticatedAppRoutes.ProgrammationByYearRoute.link(
                                pp.year
                              ),
                              target: '_self'
                            },
                            text: `Campagne ${pp.year}`,
                            isActive:
                              isActive('/programmation') &&
                              pp.id === programmingPlan?.id
                          }))
                        })
                  }
                : undefined,
              {
                linkProps: {
                  to: AuthenticatedAppRoutes.DocumentsRoute.link,
                  target: '_self'
                },
                text: 'Documents ressources',
                isActive: location.pathname.startsWith('/documents')
              }
            ]
          : []
        ).filter(isDefined)}
        quickAccessItems={[
          {
            iconId: 'fr-icon-question-fill' as const,
            buttonProps: {
              onClick: () => {
                window.open(`${config.websiteUrl}/aides`);
              }
            },
            text: 'Aides'
          },
          ...(isAuthenticated
            ? [
                <Badge
                  key="notifications"
                  variant="dot"
                  color="error"
                  overlap="circular"
                  invisible={!unReadNotifications?.length}
                  sx={{
                    '& .MuiBadge-dot': {
                      right: 15,
                      top: 10
                    }
                  }}
                >
                  <Button
                    iconId="fr-icon-notification-3-line"
                    linkProps={{
                      to: AuthenticatedAppRoutes.NotificationsRoute.link
                    }}
                    className={cx('fr-btn--icon-left', 'fr-pr-0')}
                    priority="tertiary no outline"
                    title="Notifications"
                    children={isMobile ? 'Notifications' : undefined}
                  />
                </Badge>,
                <div key="logout">
                  <div>
                    <Button
                      iconId="fr-icon-logout-box-r-line"
                      onClick={async () => {
                        const logoutRedirectUrl = await logout().unwrap();
                        window.location.href = logoutRedirectUrl.url;
                      }}
                      className={cx('fr-mb-0')}
                    >
                      Se déconnecter
                    </Button>
                    <MascaradeButton modal={mascaradeModal} />
                  </div>
                  {user?.role && (
                    <div className={cx('fr-text--sm', 'fr-mr-2w')}>
                      {UserRoleLabels[user.role]}
                    </div>
                  )}
                </div>
              ]
            : [])
        ]}
      />
      <MascaradeModal modal={mascaradeModal} />
    </>
  );
};

export default Header;
