import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import Select from '@codegouvfr/react-dsfr/Select';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { UserRoleLabels } from 'shared/schema/User/UserRole';
import { isDefined } from 'shared/utils/utils';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { api } from 'src/services/api.service';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import authSlice from 'src/store/reducers/authSlice';
import settingsSlice from 'src/store/reducers/settingsSlice';
import logo from '../../assets/logo.svg';

const Header = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, hasPermission, userInfos } = useAuthentication();
  const { programmingPlan } = useAppSelector((state) => state.settings);

  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    {},
    { skip: !isAuthenticated }
  );

  useEffect(() => {
    dispatch(
      settingsSlice.actions.changeProgrammingPlan(
        isAuthenticated
          ? programmingPlans?.find(
              (plan) => plan.year === new Date().getFullYear()
            )
          : undefined
      )
    );
  }, [programmingPlans, isAuthenticated]);

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
        title: 'Accueil',
      }}
      id="header"
      operatorLogo={{
        alt: 'Logo maestro',
        imgUrl: logo,
        orientation: 'horizontal',
      }}
      navigation={(isAuthenticated
        ? [
            programmingPlan
              ? {
                  linkProps: {
                    to: '/',
                    target: '_self',
                  },
                  text: ProgrammingPlanStatusLabels[programmingPlan.status],
                  isActive:
                    location.pathname === '/' ||
                    location.pathname.startsWith('/plans'),
                }
              : undefined,
            programmingPlan?.status === 'Validated' &&
            hasPermission('readSamples')
              ? {
                  linkProps: {
                    to: '/prelevements',
                    target: '_self',
                  },
                  text: 'Prélèvements',
                  isActive: location.pathname.startsWith('/prelevements'),
                }
              : undefined,
            {
              linkProps: {
                to: '/documents',
                target: '_self',
              },
              text: 'Documents ressources',
              isActive: location.pathname.startsWith('/documents'),
            },
          ]
        : []
      ).filter(isDefined)}
      quickAccessItems={
        isAuthenticated
          ? [
              programmingPlans &&
              hasPermission('readProgrammingPlansInProgress') ? (
                <Select
                  label={undefined}
                  nativeSelectProps={{
                    defaultValue: programmingPlans[0]?.status,
                    onChange: (e) => {
                      dispatch(
                        settingsSlice.actions.changeProgrammingPlan(
                          programmingPlans.find(
                            (programmingPlan) =>
                              programmingPlan.id === e.target.value
                          )
                        )
                      );
                      navigate('/', { replace: true });
                    },
                  }}
                  className="fr-mr-2w"
                >
                  {programmingPlans.map((programmingPlan) => (
                    <option key={programmingPlan.id} value={programmingPlan.id}>
                      {ProgrammingPlanStatusLabels[programmingPlan.status]}
                    </option>
                  ))}
                </Select>
              ) : undefined,
              <div>
                {userInfos?.roles.map((role) => (
                  <div key={role} className={cx('fr-text--sm', 'fr-mr-2w')}>
                    {UserRoleLabels[role]}
                  </div>
                ))}
                <Button
                  iconId="fr-icon-logout-box-r-line"
                  onClick={() => {
                    dispatch(authSlice.actions.signoutUser());
                    dispatch(api.util.resetApiState());
                  }}
                >
                  Se déconnecter
                </Button>
              </div>,
            ].filter(isDefined)
          : [
              {
                linkProps: {
                  to: '/connexion',
                },
                iconId: 'fr-icon-user-fill',
                text: 'Se connecter',
              },
            ]
      }
    />
  );
};

export default Header;
