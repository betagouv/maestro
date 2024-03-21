import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { AnyZodObject, z, ZodArray } from 'zod';

export const body = (o: AnyZodObject | ZodArray<any>) =>
  z.object({
    body: o,
  });

export const params = (o: AnyZodObject) =>
  z.object({
    params: o,
  });

export const uuidParam = (paramName: string) =>
  z.object({
    params: z.object({
      [paramName]: z.string().uuid(),
    }),
  });

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedReq = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
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
  validate,
};
