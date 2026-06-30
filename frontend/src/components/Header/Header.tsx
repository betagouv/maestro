import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Badge } from '@mui/material';
import clsx from 'clsx';
import { uniq } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import { isClosed } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { UserBase } from 'maestro-shared/schema/User/User';
import {
  type UserRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useMemo, useRef } from 'react';
import { matchPath, useLocation } from 'react-router';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import {
  useChangeRoleMutation,
  useLogoutMutation
} from 'src/services/auth.service';
import { type AppRoutePath, AuthenticatedAppRoutes } from '../../AppRoutes';
import logo from '../../assets/logo.svg';
import useWindowSize from '../../hooks/useWindowSize';
import { api } from '../../services/api.service';
import { ApiClientContext } from '../../services/apiClient';
import authSlice from '../../store/reducers/authSlice';
import config from '../../utils/config';
import { adminSections } from '../../views/AdminView/adminSections';
import { MascaradeButton } from '../Mascarade/MascaradeButton';
import { MascaradeModal } from '../Mascarade/MascaradeModal';
import { useMascarade } from '../Mascarade/useMascarade';
import HeaderMenu from './HeaderMenu';

const mascaradeModal = createModal({
  id: `mascarade-modale-id`,
  isOpenedByDefault: false
});

const Header = () => {
  const location = useLocation();
  const { isMobile } = useWindowSize();
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);

  const roleMenuRef = useRef<
    (HTMLDivElement & { closeMenu: () => Promise<boolean> }) | null
  >(null);

  const {
    isAuthenticated,
    hasUserPermission,
    user,
    userRole,
    availableRoutes
  } = useAuthentication();
  const userRefined = UserBase.optional().parse(user);
  const { mascaradeEnabled, disableMascarade } = useMascarade();
  const { data: programmingPlansData } = apiClient.useFindProgrammingPlansQuery(
    {},
    { skip: !isAuthenticated }
  );
  const programmingPlans = useMemo(
    () => programmingPlansData?.filter((p) => p.domain !== 'TO_BE_DEFINED'),
    [programmingPlansData]
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
  const [changeRole] = useChangeRoleMutation();

  const inProgressYears = useMemo(
    () =>
      uniq(
        programmingPlans
          ?.filter((pp) =>
            [...pp.regionalStatus, ...pp.departmentalStatus].some(
              (rs) => rs.status === 'Validated'
            )
          )
          .map((pp) => pp.year)
      ),
    [programmingPlans]
  );

  const closedYears = useMemo(
    () => programmingPlans?.filter((pp) => isClosed(pp)).map((pp) => pp.year),
    [programmingPlans]
  );

  const routeMatch = <Path extends AppRoutePath>(path: Path, exact = false) =>
    matchPath({ path, end: exact }, location.pathname);

  const changeUserRole = useCallback(
    async (userRole: UserRole) => {
      if (user) {
        const authUser = await changeRole({ newRole: userRole }).unwrap();
        dispatch(api.util.resetApiState());
        dispatch(
          authSlice.actions.signinUser({
            authUser
          })
        );
        window.location.reload();
      }
    },
    [user]
  );

  return (
    <>
      <DSFRHeader
        brandTop={
          <>
            Ministère
            <br />
            de l'Agriculture
            <br />
            de l'Agro-alimentaire
            <br />
            et de la Souveraineté
            <br />
            alimentaire
          </>
        }
        homeLinkProps={{
          to: hasUserPermission('viewDashboard')
            ? AuthenticatedAppRoutes.DashboardRoute.link()
            : AuthenticatedAppRoutes.DocumentsRoute.link(),
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
              hasUserPermission('viewDashboard')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.DashboardRoute.link(),
                      target: '_self'
                    },
                    text: 'Tableau de bord',
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes.DashboardRoute.path,
                      true
                    )
                  }
                : undefined,
              hasUserPermission('readSamples') && inProgressYears?.length
                ? {
                    isActive: (() => {
                      const samplesByYear = routeMatch(
                        AuthenticatedAppRoutes.SamplesByYearRoute.path
                      );
                      return (
                        (!!samplesByYear &&
                          inProgressYears?.includes(
                            Number(samplesByYear.params.year)
                          )) ||
                        !!routeMatch(AuthenticatedAppRoutes.SampleRoute.path)
                      );
                    })(),
                    ...(inProgressYears?.length === 1
                      ? {
                          text: 'Prélèvements',
                          linkProps: {
                            to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                              inProgressYears[0]
                            ),
                            target: '_self'
                          }
                        }
                      : {
                          text: 'Prélèvements',
                          menuLinks: (inProgressYears ?? []).map((year) => ({
                            linkProps: {
                              to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                                year
                              ),
                              target: '_self'
                            },
                            text: year,
                            isActive:
                              routeMatch(
                                AuthenticatedAppRoutes.SamplesByYearRoute.path
                              )?.params.year === String(year)
                          }))
                        })
                  }
                : undefined,
              hasUserPermission('viewProgrammingPlans')
                ? {
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes.ProgrammingRoute.path,
                      true
                    ),
                    text: 'Programmation',
                    linkProps: {
                      to: AuthenticatedAppRoutes.ProgrammingRoute.link(),
                      target: '_self'
                    }
                  }
                : undefined,
              (hasUserPermission('viewProgrammingPlans') ||
                hasUserPermission('readSamples')) &&
              closedYears?.length
                ? {
                    isActive: closedYears?.some((year) => {
                      const programmingByYear = routeMatch(
                        AuthenticatedAppRoutes.ProgrammingByYearRoute.path,
                        true
                      );
                      const samplesByYear = routeMatch(
                        AuthenticatedAppRoutes.SamplesByYearRoute.path
                      );
                      return (
                        programmingByYear?.params.year === String(year) ||
                        samplesByYear?.params.year === String(year)
                      );
                    }),
                    text: 'Historique',
                    menuLinks: (closedYears ?? []).flatMap((year) => [
                      {
                        linkProps: {
                          to: AuthenticatedAppRoutes.SamplesByYearRoute.link(
                            year
                          ),
                          target: '_self'
                        },
                        text: `Prélèvements ${year}`,
                        isActive:
                          routeMatch(
                            AuthenticatedAppRoutes.SamplesByYearRoute.path
                          )?.params.year === String(year)
                      },
                      {
                        linkProps: {
                          to: AuthenticatedAppRoutes.ProgrammingByYearRoute.link(
                            year
                          ),
                          target: '_self'
                        },
                        text: `Programmation ${year}`,
                        isActive:
                          routeMatch(
                            AuthenticatedAppRoutes.ProgrammingByYearRoute.path,
                            true
                          )?.params.year === String(year)
                      }
                    ])
                  }
                : undefined,
              availableRoutes.includes('LaboratoryAgreementsRoute')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.LaboratoryAgreementsRoute.link(),
                      target: '_self'
                    },
                    text: 'Agréments laboratoires',
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes.LaboratoryAgreementsRoute.path
                    )
                  }
                : undefined,
              {
                linkProps: {
                  to: AuthenticatedAppRoutes.DocumentsRoute.link(),
                  target: '_self'
                },
                text: 'Documents ressources',
                isActive: !!routeMatch(
                  AuthenticatedAppRoutes.DocumentsRoute.path
                )
              },
              hasUserPermission('administrationMaestro')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.UsersRoute.link(),
                      target: '_self'
                    },
                    text: 'Utilisateurs',
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes.UsersRoute.path
                    )
                  }
                : undefined,
              hasUserPermission('administrationMaestro')
                ? {
                    text: 'Administration',
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes.AdminRoute.path
                    ),
                    menuLinks: adminSections.map((s) => ({
                      linkProps: {
                        to: AuthenticatedAppRoutes.AdminRoute.link(s.slug),
                        target: '_self'
                      },
                      text: s.label,
                      isActive:
                        location.pathname ===
                        AuthenticatedAppRoutes.AdminRoute.link(s.slug)
                    }))
                  }
                : undefined,
              availableRoutes.includes('LaboratoryAnalyticalCompetencesRoute')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.LaboratoryAnalyticalCompetencesRoute.link(),
                      target: '_self'
                    },
                    text: 'Compétences analytiques',
                    isActive: !!routeMatch(
                      AuthenticatedAppRoutes
                        .LaboratoryAnalyticalCompetencesRoute.path
                    )
                  }
                : undefined
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
                      to: AuthenticatedAppRoutes.NotificationsRoute.link()
                    }}
                    className={cx('fr-btn--icon-left', 'fr-pr-0')}
                    priority="tertiary no outline"
                    title="Notifications"
                  >
                    {isMobile ? 'Notifications' : undefined}
                  </Button>
                </Badge>,
                userRole &&
                userRefined?.roles &&
                userRefined.roles.length > 1 ? (
                  <HeaderMenu
                    key="roleMenu"
                    ref={roleMenuRef}
                    value={UserRoleLabels[userRole]}
                    menuItems={userRefined.roles.map((role) => (
                      <Button
                        key={`role-menu-${role}`}
                        onClick={() => changeUserRole(role)}
                        className={clsx(cx('fr-m-0'), 'no-wrap')}
                      >
                        {UserRoleLabels[role]}
                      </Button>
                    ))}
                  />
                ) : undefined,
                <HeaderMenu
                  key="userMenu"
                  value={`${user?.name}`}
                  menuItems={[
                    <MascaradeButton
                      modal={mascaradeModal}
                      key="mascarade-button"
                    />,
                    <Button
                      iconId="fr-icon-logout-box-r-line"
                      onClick={async () => {
                        if (mascaradeEnabled) {
                          await disableMascarade();
                        } else {
                          const logoutRedirectUrl = await logout().unwrap();
                          window.location.href = logoutRedirectUrl.url;
                        }
                      }}
                      key="logout-button"
                    >
                      Se déconnecter
                    </Button>
                  ]}
                />
              ].filter((_) => _ !== undefined)
            : [])
        ]}
      />
      <MascaradeModal modal={mascaradeModal} />
    </>
  );
};

export default Header;
