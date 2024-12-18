import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';
import HomeView from 'src/views/HomeView/HomeView';

export const LogoutCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await appLogout()(dispatch);
      navigate('/');
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <HomeView></HomeView>;
};

export default LogoutCallbackView;
