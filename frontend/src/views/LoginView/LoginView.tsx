import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { useAuthenticateMutation } from 'src/services/auth.service';
import authSlice from 'src/store/reducers/authSlice';

export const LoginView = () => {
  const dispatch = useAppDispatch();
  const [authenticate] = useAuthenticateMutation();
  const navigate = useNavigate();

  useEffect(() => {
    (() =>
      authenticate({
        url: window.location.href,
        nonce: sessionStorage.getItem('nonce') || '',
        state: sessionStorage.getItem('state') || ''
      })
        .unwrap()
        .then((authUser) => {
          dispatch(authSlice.actions.signinUser({ authUser }));
          navigate('/');
        }))();
  }, [window.location.href]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div>Merci de patienter....</div>;
};

export default LoginView;
