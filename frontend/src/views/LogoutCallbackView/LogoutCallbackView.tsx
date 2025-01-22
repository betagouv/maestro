import { useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';
import { SESSION_STORAGE_UNKNOWN_USER } from 'src/views/LoginCallbackView/LoginCallbackView';
import { HomeViewContainer } from 'src/views/HomeView/HomeView';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import userUnknownSvg from '../../assets/illustrations/user-unknown.svg';

const EMAIL_SUPPORT = 'manon@maestro.fr'

export const LogoutCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isUserUnknown : boolean = sessionStorage.getItem(SESSION_STORAGE_UNKNOWN_USER) !== null

  useEffect(() => {
    (async () => {
      await appLogout()(dispatch);
      if( sessionStorage.getItem(SESSION_STORAGE_UNKNOWN_USER) !== null  ){
        sessionStorage.removeItem(SESSION_STORAGE_UNKNOWN_USER)
      }else if( !isUserUnknown ){
        navigate('/')
      }
    })();
  }, [dispatch, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return <HomeViewContainer>
    <img
    src={userUnknownSvg}
    height="100%"
    aria-hidden
    alt=""
  />
    <h2 className={cx('fr-mb-2w')}>
      Vous ne disposez pas des autorisations nécessaires pour accéder à maestro.
    </h2>
    <div className={cx('fr-text--lg', 'fr-mb-5w')}>
      L’outil est uniquement accessible aux agents de la Direction Générale de l’Alimentation.
      <br/>
      Contactez <a href={`mailto:${EMAIL_SUPPORT}`}>{EMAIL_SUPPORT}</a> en cas de besoin spécifique.
    </div>
  </HomeViewContainer> ;
};

export default LogoutCallbackView;
