import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useLocation } from 'react-router-dom';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import { useLogoutMutation } from 'src/services/auth.service';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import logo from '../../assets/logo.svg';

const Header = () => {
  const location = useLocation();

  const { isAuthenticated, hasUserPermission, user } = useAuthentication();

  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    {},
    { skip: !isAuthenticated }
  );
  const [logout] = useLogoutMutation();

  const validatedProgrammingPlans = programmingPlans?.filter(
    (pp) => pp.status === 'Validated'
  );

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
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
        to: '/',
        title: 'Accueil'
      }}
      id="header"
      operatorLogo={{
        alt: 'Logo maestro',
        imgUrl: logo,
        orientation: 'horizontal'
      }}
      navigation={(isAuthenticated
        ? [
            {
              linkProps: {
                to: '/',
                target: '_self'
              },
              text: 'Tableau de bord',
              isActive:
                location.pathname === '/' ||
                location.pathname.startsWith('/plans')
            },
            hasUserPermission('readSamples')
              ? {
                  isActive: isActive('/prelevements'),
                  ...(validatedProgrammingPlans?.length === 1
                    ? {
                        text: 'Prélèvements',
                        linkProps: {
                          to: `/prelevements/${validatedProgrammingPlans[0].year}`,
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
                              to: `/prelevements/${pp.year}`,
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
            {
              isActive: isActive('/prescriptions'),
              ...(programmingPlans?.length === 1
                ? {
                    text: 'Programmation',
                    linkProps: {
                      to: `/prescriptions/${programmingPlans[0].year}`,
                      target: '_self'
                    }
                  }
                : {
                    text: `Programmation ${
                      isActive('/prescriptions') && programmingPlan
                        ? programmingPlan.year
                        : ''
                    }`,
                    menuLinks: (programmingPlans ?? []).map((pp) => ({
                      linkProps: {
                        to: `/prescriptions/${pp.year}`,
                        target: '_self'
                      },
                      text: `Campagne ${pp.year}`,
                      isActive:
                        isActive('/prescriptions') &&
                        pp.id === programmingPlan?.id
                    }))
                  })
            },
            {
              linkProps: {
                to: '/documents',
                target: '_self'
              },
              text: 'Documents ressources',
              isActive: location.pathname.startsWith('/documents')
            }
          ]
        : []
      ).filter(isDefined)}
      quickAccessItems={
        isAuthenticated
          ? [
              <div>
                {user?.roles.map((role) => (
                  <div key={role} className={cx('fr-text--sm', 'fr-mr-2w')}>
                    {UserRoleLabels[role]}
                  </div>
                ))}
                <Button
                  iconId="fr-icon-logout-box-r-line"
                  onClick={async () => {
                    const logoutRedirectUrl = await logout().unwrap();
                    window.location.href = logoutRedirectUrl.url;
                  }}
                >
                  Se déconnecter
                </Button>
              </div>
            ].filter(isDefined)
          : []
      }
    />
  );
};

export default Header;
