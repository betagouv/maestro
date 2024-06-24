import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import Select from '@codegouvfr/react-dsfr/Select';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels,
} from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { UserRoleLabels } from 'shared/schema/User/UserRole';
import { isDefined } from 'shared/utils/utils';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { api } from 'src/services/api.service';
import authSlice from 'src/store/reducers/authSlice';
import settingsSlice from 'src/store/reducers/settingsSlice';
import logo from '../../assets/logo.svg';

const Header = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, hasPermission, userInfos } = useAuthentication();
  const { programmingPlanStatus } = useAppSelector((state) => state.settings);

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
            {
              linkProps: {
                to: '/',
                target: '_self',
              },
              text: ProgrammingPlanStatusLabels[programmingPlanStatus],
              isActive:
                location.pathname === '/' ||
                location.pathname.startsWith('/plans'),
            },
            programmingPlanStatus === 'Validated' &&
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
              hasPermission('readProgrammingPlansInProgress') && (
                <Select
                  label={undefined}
                  nativeSelectProps={{
                    defaultValue: programmingPlanStatus,
                    onChange: (e) => {
                      dispatch(
                        settingsSlice.actions.changeProgrammingPlanStatus({
                          programmingPlanStatus: e.target
                            .value as ProgrammingPlanStatus,
                        })
                      );
                      navigate('/', { replace: true });
                    },
                  }}
                  className="fr-mr-2w"
                >
                  <option value="Validated">
                    {ProgrammingPlanStatusLabels['Validated']}
                  </option>
                  <option value="InProgress">
                    {ProgrammingPlanStatusLabels['InProgress']}
                  </option>
                </Select>
              ),
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
            ]
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
