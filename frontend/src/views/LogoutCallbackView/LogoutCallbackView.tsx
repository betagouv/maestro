import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';
import { SESSION_STORAGE_UNKNOWN_USER } from 'src/views/LoginCallbackView/LoginCallbackView';

export const LogoutCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isUserUnknown = useRef<boolean>(false)

  useEffect(() => {
    (async () => {
      await appLogout()(dispatch);
      if( sessionStorage.getItem(SESSION_STORAGE_UNKNOWN_USER) !== null  ){
        sessionStorage.removeItem(SESSION_STORAGE_UNKNOWN_USER)
        isUserUnknown.current = true
      }else if( !isUserUnknown.current ){
        navigate('/')
      }
    })();
  }, [dispatch, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div>TODO</div> ;
};

export default LogoutCallbackView;
