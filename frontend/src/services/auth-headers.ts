export const withAuthHeader = (headers: Headers) => {
  const authUser = JSON.parse(localStorage.getItem('authUser') ?? '{}');
  if (authUser?.accessToken) {
    const newHeaders = new Headers(headers);
    newHeaders.append('x-access-token', authUser.accessToken);
    return newHeaders;
  } else {
    return headers;
  }
};

export const withAuthParams = (url: string) => {
  const authUser = JSON.parse(localStorage.getItem('authUser') ?? '{}');
  if (authUser?.accessToken) {
    return `${url}?x-access-token=${authUser.accessToken}`;
  } else {
    return url;
  }
};
