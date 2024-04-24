import fetchIntercept from 'fetch-intercept';
import { useAppDispatch } from 'src/hooks/useStore';
import { api } from 'src/services/api.service';
import authSlice from 'src/store/reducers/authSlice';

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
        dispatch(authSlice.actions.signoutUser());
        dispatch(api.util.resetApiState());
      }
      return response;
    },

    responseError: function (error) {
      return Promise.reject(error);
    },
  });
};

export default FetchInterceptor;
