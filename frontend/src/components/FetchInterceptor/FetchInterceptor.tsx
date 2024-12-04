import fetchIntercept from 'fetch-intercept';
import { useAppDispatch } from 'src/hooks/useStore';
import { logout } from 'src/store/store';

const FetchInterceptor = () => {
  const dispatch = useAppDispatch();
  return fetchIntercept.register({
    request: function (url, config) {
      return [url, config];
    },

    requestError: function (error) {
      return Promise.reject(error);
    },

    response: function (response) {
      if (response.status === 401) {
        logout()(dispatch);
      }
      return response;
    },

    responseError: function (error) {
      return Promise.reject(error);
    }
  });
};

export default FetchInterceptor;
