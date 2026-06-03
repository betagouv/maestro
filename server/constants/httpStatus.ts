type HttpStatusCode<N extends number> = N & {
  readonly __httpStatusBrand: 'HttpStatus';
};

const brand = <const T extends Record<string, number>>(statuses: T) =>
  statuses as { [K in keyof T]: HttpStatusCode<T[K]> };

export const HttpStatus = brand({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
});

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

export type ResponseStatus = typeof HttpStatus.OK | typeof HttpStatus.CREATED;

export type EmptyStatus = Exclude<HttpStatus, ResponseStatus>;
