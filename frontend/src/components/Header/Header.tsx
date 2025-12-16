import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Badge } from '@mui/material';
import clsx from 'clsx';
import { uniq } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { isClosed } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { UserRole, UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { useLogoutMutation } from 'src/services/auth.service';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import logo from '../../assets/logo.svg';
import { usePrescriptionFilters } from '../../hooks/usePrescriptionFilters';
import useWindowSize from '../../hooks/useWindowSize';
import { api } from '../../services/api.service';
import { ApiClientContext } from '../../services/apiClient';
import authSlice from '../../store/reducers/authSlice';
import prescriptionsSlice from '../../store/reducers/prescriptionsSlice';
import config from '../../utils/config';
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

  const domainMenuRef = useRef<
    (HTMLDivElement & { closeMenu: () => Promise<boolean> }) | null
  >(null);
  const roleMenuRef = useRef<
    (HTMLDivElement & { closeMenu: () => Promise<boolean> }) | null
  >(null);

  const { isAuthenticated, hasUserPermission, user, userRole } =
    useAuthentication();
  const { mascaradeEnabled, disableMascarade } = useMascarade();
  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

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

  const { domainOptions, reduceFilters } =
    usePrescriptionFilters(programmingPlans);

  useEffect(() => {
    if (!prescriptionFilters.domain && domainOptions.length > 0) {
      dispatch(
        prescriptionsSlice.actions.changePrescriptionFilters(
          reduceFilters(prescriptionFilters, {
            domain: domainOptions[0]
          })
        )
      );
    }
  });

  const inProgressYears = useMemo(
    () =>
      uniq(
        programmingPlans
          ?.filter(
            (pp) =>
              pp.domain === prescriptionFilters.domain &&
              [...pp.regionalStatus, ...pp.departmentalStatus].some(
                (rs) => rs.status === 'Validated'
              )
          )
          .map((pp) => pp.year)
      ),
    [programmingPlans, prescriptionFilters.domain]
  );

  const closedYears = useMemo(
    () =>
      programmingPlans
        ?.filter(
          (pp) => pp.domain === prescriptionFilters.domain && isClosed(pp)
        )
        .map((pp) => pp.year),
    [programmingPlans, prescriptionFilters.domain]
  );

  const isActive = (path: string, strictPath = false) =>
    strictPath
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const changeUserRole = useCallback(
    (userRole: UserRole) => {
      if (user) {
        dispatch(api.util.resetApiState());
        dispatch(
          authSlice.actions.signinUser({
            authUser: {
              user,
              userRole
            }
          })
        );
        window.location.reload();
      }
    },
    [user] // eslint-disable-line react-hooks/exhaustive-deps
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
            et de la Souveraineté
            <br />
            alimentaire
          </>
        }
        homeLinkProps={{
          to: hasUserPermission('viewDashboard')
            ? AuthenticatedAppRoutes.DashboardRoute.link
            : AuthenticatedAppRoutes.DocumentsRoute.link,
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
                      to: AuthenticatedAppRoutes.DashboardRoute.link,
                      target: '_self'
                    },
                    text: 'Tableau de bord',
                    isActive:
                      location.pathname ===
                        AuthenticatedAppRoutes.DashboardRoute.link ||
                      location.pathname.startsWith('/plans')
                  }
                : undefined,
              hasUserPermission('readSamples') && inProgressYears?.length
                ? {
                    isActive:
                      inProgressYears?.some((year) =>
                        isActive(`/programmation/${year}/prelevements`)
                      ) || isActive('/prelevements'),
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
                              isActive('/prelevements') &&
                              year === programmingPlan?.year
                          }))
                        })
                  }
                : undefined,
              hasUserPermission('readProgrammingPlans')
                ? {
                    isActive: isActive(`/programmation`, true),
                    text: 'Programmation',
                    linkProps: {
                      to: AuthenticatedAppRoutes.ProgrammingRoute.link,
                      target: '_self'
                    }
                  }
                : undefined,
              (hasUserPermission('readProgrammingPlans') ||
                hasUserPermission('readSamples')) &&
              closedYears?.length
                ? {
                    isActive: closedYears?.some(
                      (year) =>
                        isActive(`/programmation/${year}`, true) ||
                        isActive(`/programmation/${year}/prelevements`)
                    ),
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
                        isActive: isActive(
                          `/programmation/${year}/prelevements`
                        )
                      },
                      {
                        linkProps: {
                          to: AuthenticatedAppRoutes.ProgrammingRoute.link,
                          target: '_self'
                        },
                        text: `Programmation ${year}`,
                        isActive: isActive(`/programmation/${year}`, true)
                      }
                    ])
                  }
                : undefined,
              {
                linkProps: {
                  to: AuthenticatedAppRoutes.DocumentsRoute.link,
                  target: '_self'
                },
                text: 'Documents ressources',
                isActive: location.pathname.startsWith('/documents')
              },
              hasUserPermission('administrationMaestro')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.UsersRoute.link,
                      target: '_self'
                    },
                    text: 'Utilisateurs',
                    isActive: location.pathname.startsWith('/utilisateurs')
                  }
                : undefined,
              hasUserPermission('administrationMaestro')
                ? {
                    linkProps: {
                      to: AuthenticatedAppRoutes.AdminRoute.link,
                      target: '_self'
                    },
                    text: 'Administration',
                    isActive: location.pathname.startsWith('/admin')
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
                      to: AuthenticatedAppRoutes.NotificationsRoute.link
                    }}
                    className={cx('fr-btn--icon-left', 'fr-pr-0')}
                    priority="tertiary no outline"
                    title="Notifications"
                    children={isMobile ? 'Notifications' : undefined}
                  />
                </Badge>,
                prescriptionFilters?.domain && domainOptions.length > 1 ? (
                  <HeaderMenu
                    key="domainMenu"
                    ref={domainMenuRef}
                    value={
                      ProgrammingPlanDomainLabels[prescriptionFilters.domain]
                    }
                    menuItems={domainOptions.map((domain) => (
                      <Button
                        key={`domain-menu-${domain}`}
                        onClick={() => {
                          dispatch(
                            prescriptionsSlice.actions.changePrescriptionFilters(
                              reduceFilters(prescriptionFilters, {
                                domain
                              })
                            )
                          );
                          domainMenuRef.current?.closeMenu();
                        }}
                        className={clsx(cx('fr-m-0'), 'no-wrap')}
                      >
                        {ProgrammingPlanDomainLabels[domain]}
                      </Button>
                    ))}
                  />
                ) : undefined,
                userRole && user?.roles && user.roles.length > 1 ? (
                  <HeaderMenu
                    key="roleMenu"
                    ref={roleMenuRef}
                    value={UserRoleLabels[userRole]}
                    menuItems={user.roles.map((role) => (
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
