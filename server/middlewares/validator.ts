import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { AnyZodObject } from 'zod';

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('req.body', req.body);
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(error);
    }
  };

export default {
  validate,
};
