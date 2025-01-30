import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Brand } from 'maestro-shared/constants';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';
import { HomeViewContainer } from 'src/views/HomeView/HomeView';
import { SESSION_STORAGE_UNKNOWN_USER_EMAIl } from 'src/views/LoginCallbackView/LoginCallbackView';
import userUnknownSvg from '../../assets/illustrations/user-unknown.svg';
import config from '../../utils/config';

export const LogoutCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const unknownUserEmail: string | null =
    sessionStorage.getItem(SESSION_STORAGE_UNKNOWN_USER_EMAIl) ?? null;
  const isCertifiedAgent: boolean =
    unknownUserEmail?.endsWith('@agriculture.gouv.fr') ?? false;

  useEffect(() => {
    (async () => {
      await appLogout()(dispatch);
      if (sessionStorage.getItem(SESSION_STORAGE_UNKNOWN_USER_EMAIl) !== null) {
        sessionStorage.removeItem(SESSION_STORAGE_UNKNOWN_USER_EMAIl);
      } else if (unknownUserEmail === null) {
        navigate('/');
      }
    })();
  }, [dispatch, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HomeViewContainer>
      <img src={userUnknownSvg} height="100%" aria-hidden alt="" />
      <div className={cx('fr-text--regular', 'fr-mb-2w')}>
        Email: {unknownUserEmail}
      </div>
      <h2 className={cx('fr-mb-2w')}>
        Vous ne disposez pas actuellement des autorisations nécessaires pour
        accéder à {Brand}.
      </h2>
      <div className={cx('fr-text--lg', 'fr-mb-5w')}>
        {isCertifiedAgent ? (
          <>
            Contactez{' '}
            <a href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a>{' '}
            pour obtenir votre habilitation.
          </>
        ) : (
          <>
            L’outil est uniquement accessible aux agents de la Direction
            Générale de l’Alimentation.
            <br />
            Contactez{' '}
            <a href={`mailto:${config.supportEmail}`}>
              {config.supportEmail}
            </a>{' '}
            en cas de besoin.
          </>
        )}
      </div>
    </HomeViewContainer>
  );
};

export default LogoutCallbackView;
