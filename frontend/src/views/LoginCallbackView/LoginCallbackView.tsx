import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import {
  useAuthenticateMutation,
  useLogoutMutation
} from 'src/services/auth.service';
import authSlice from 'src/store/reducers/authSlice';
import { appLogout } from 'src/store/store';

export const SESSION_STORAGE_UNKNOWN_USER_EMAIl = 'UNKNOWN_MAESTRO_USER_EMAIL';

export const LoginCallbackView = () => {
  const dispatch = useAppDispatch();
  const [authenticate, { isLoading, isSuccess, isError, data: authUser }] =
    useAuthenticateMutation();

  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (hasAuthenticatedRef.current) {
      return;
    }
    hasAuthenticatedRef.current = true;

    authenticate({
      url: window.location.href,
      nonce: sessionStorage.getItem('nonce'),
      state: sessionStorage.getItem('state')
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isSuccess) {
      dispatch(authSlice.actions.signinUser({ authUser }));
      if (authUser.user !== null) {
        navigate('/');
      } else {
        const asyncLogout = async () => {
          sessionStorage.setItem(
            SESSION_STORAGE_UNKNOWN_USER_EMAIl,
            authUser.userEmail
          );
          const logoutRedirectUrl = await logout().unwrap();
          await appLogout()(dispatch);
          window.location.href = logoutRedirectUrl.url;
        };
        asyncLogout();
      }
    }
  }, [
    isSuccess,
    authUser
  ]) /* eslint-disable-line react-hooks/exhaustive-deps */;

  return (
    <section className={clsx(cx('fr-container-sm'), 'main-section')}>
      {isLoading && (
        <Alert
          severity="info"
          title="Connexion en cours"
          description={
            <>
              <div className={cx('fr-pt-1w', 'fr-pb-3w')}>
                Merci de patienter...
              </div>
              <Button
                linkProps={{
                  to: '/'
                }}
                priority="tertiary no outline"
                className={clsx(cx('fr-link'), 'link-underline')}
              >
                Retour à l'accueil
              </Button>
            </>
          }
        ></Alert>
      )}
      {isError && (
        <Alert
          severity="error"
          title="Erreur de connexion"
          description={
            <>
              <div className={cx('fr-pt-1w', 'fr-pb-3w')}>
                Une erreur est survenue lors de la connexion.
              </div>
              <Button
                linkProps={{
                  to: '/'
                }}
                priority="tertiary no outline"
                className={clsx(cx('fr-link'), 'link-underline')}
              >
                Retour à l'accueil
              </Button>
            </>
          }
        ></Alert>
      )}
    </section>
  );
};

export default LoginCallbackView;
