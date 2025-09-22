import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import sanitizeHtml from 'sanitize-html';
import { z, ZodArray, ZodObject } from 'zod';
export const body = (o: ZodObject | ZodArray<any>) =>
  z.object({
    body: o
  });

export const query = (o: ZodObject) =>
  z.object({
    query: o
  });

const sanitizeObject = (obj: unknown): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce(
      (acc, key) => {
        return {
          ...acc,
          [key]: sanitizeObject((obj as Record<string, unknown>)[key])
        };
      },
      {} as Record<string, unknown>
    );
  }

  return obj;
};

const validate =
  (
    schema: ZodObject,
    options: { skipSanitization: boolean } = { skipSanitization: false }
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedReq = await schema.parseAsync({
        body: options.skipSanitization ? req.body : sanitizeObject(req.body),
        query: options.skipSanitization ? req.query : sanitizeObject(req.query),
        params: options.skipSanitization
          ? req.params
          : sanitizeObject(req.params)
      });
      ['body', 'cookies', 'headers', 'params', 'query'].forEach((location) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req[location] = parsedReq[location];
      });
      return next();
    } catch (error) {
      console.error(error);
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(error);
    }
  };

export default {
  validate
};
