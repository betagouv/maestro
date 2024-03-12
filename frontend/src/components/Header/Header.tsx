import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { useLocation } from 'react-router-dom';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import authSlice from 'src/store/reducers/authSlice';

const Header = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { isAuthenticated } = useAuthentication();

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
      // serviceTagline="baseline - précisions sur l'organisation"
      serviceTitle={
        <>
          Plan de Surveillance
          <br />
          Plan de Contrôle
        </>
      }
      navigation={
        isAuthenticated
          ? [
              {
                linkProps: {
                  to: '/prelevements',
                  target: '_self',
                },
                text: 'Prélèvements',
                isActive: location.pathname.startsWith('/prelevements'),
              },
            ]
          : []
      }
      quickAccessItems={[
        isAuthenticated
          ? {
              buttonProps: {
                onClick: () => {
                  dispatch(authSlice.actions.signoutUser());
                },
              },
              iconId: 'fr-icon-logout-box-r-line',
              text: 'Se déconnecter',
            }
          : {
              linkProps: {
                to: '/connexion',
              },
              iconId: 'fr-icon-user-fill',
              text: 'Se connecter',
            },
      ]}
    />
  );
};

export default Header;
