import fetchMock, {
  FetchMock,
  MockResponseInit,
  MockResponseInitFunction,
} from 'jest-fetch-mock';

export interface RequestCall {
  url: string;
  body: any;
}

export const getRequestCalls = (fetchMock: FetchMock) =>
  Promise.all(
    fetchMock.mock.calls.map(async (call) => {
      const request = call[0] as Request;
      if (request.url) {
        const body = request.body ? await request.json() : null;
        return {
          url: request.url,
          method: request.method,
          body,
        };
      }
    })
  );

export interface RequestMatch {
  pathname: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  response: MockResponseInitFunction | MockResponseInit;
}

export const mockRequests = (matches: RequestMatch[]): void => {
  function predicates(match: RequestMatch) {
    return [
      (request: Request) => request.url.endsWith(match.pathname),
      (request: Request) =>
        match.method ? request.method === match.method : true,
      // Add predicates here to match more request properties
    ];
  }

  fetchMock.mockResponse((request): Promise<MockResponseInit | string> => {
    const match = matches.find((match) => {
      return predicates(match).every((predicate) => predicate(request));
    });
    if (!match) {
      throw new MockError(request);
    }

    return isMockResponseInitFunction(match.response)
      ? match.response(request)
      : Promise.resolve(match.response);
  });
};

const isMockResponseInitFunction = (
  response: unknown
): response is MockResponseInitFunction => typeof response === 'function';

class MockError extends Error {
  constructor(request: Request) {
    super(`Request to ${request.url} must be mocked`);
    this.name = 'MockError';
  }
}
