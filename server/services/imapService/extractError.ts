import { type ZodError, z } from 'zod';

export class ExtractError extends Error {}

export class ExtractBadFormatError extends Error {
  constructor(error: ZodError) {
    super(z.prettifyError(error));
  }
}
