import fetchIntercept from 'fetch-intercept';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/hooks/useStore';
import { appLogout } from 'src/store/store';

const FetchInterceptor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return fetchIntercept.register({
    request: function (url, config) {
      return [url, config];
    },

    requestError: function (error) {
      return Promise.reject(error);
    },

    response: function (response) {
      if (response.status === 401) {
        (async () => {
          await appLogout()(dispatch);
          navigate('/');
        })();
      }
      return response;
    },

    responseError: function (error) {
      return Promise.reject(error);
    }
  });
};

export default FetchInterceptor;
