import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';

export const LogoutCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await appLogout()(dispatch);
      navigate('/');
    })();
  }, [window.location.href]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div>Déconnexion ... Merci de patienter....</div>;
};

export default LogoutCallbackView;
