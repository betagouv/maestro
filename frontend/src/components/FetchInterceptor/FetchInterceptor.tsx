import fetchIntercept from 'fetch-intercept';
import { useLogoutMutation } from 'src/services/auth.service';

const FetchInterceptor = () => {
  const [logout] = useLogoutMutation();
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
          const logoutRedirectUrl = await logout().unwrap();
          window.location.href = logoutRedirectUrl.url;
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
