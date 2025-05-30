import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import sanitizeHtml from 'sanitize-html';
import { AnyZodObject, z, ZodArray } from 'zod';
export const body = (o: AnyZodObject | ZodArray<any>) =>
  z.object({
    body: o
  });

export const params = (o: AnyZodObject) =>
  z.object({
    params: o
  });

export const query = (o: AnyZodObject) =>
  z.object({
    query: o
  });

export const uuidParam = (paramName: string) =>
  z.object({
    params: z.object({
      [paramName]: z.string().uuid()
    })
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
    schema: AnyZodObject,
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
