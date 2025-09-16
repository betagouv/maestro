import { z, ZodError } from 'zod';

export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ExtractBadFormatError extends Error {
  constructor(error: ZodError) {
    super(z.prettifyError(error));
  }
}
