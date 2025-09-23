import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, test } from 'vitest';
import { z, ZodObject } from 'zod';
import { validateRequest } from '../validator';

const validate =
  (
    schema: ZodObject,
    options: { skipSanitization: boolean } = { skipSanitization: false }
  ) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsedReq = await validateRequest(req, schema, options)

          req.body = parsedReq.body
        return next();
      } catch (error) {
        console.error(error);
        return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(error);
      }
    };


describe('Validator middleware', () => {
  describe('Integration test', () => {
    const testRoute = `/validate/${uuidv4()}`;
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.post(
      '/validate/:id',
      validate(
        z.object({
          body: z
            .object({
              name: z.string().min(5)
            })
            .optional(),
          header: z
            .object({
              'custom-header': z.string().min(10).optional()
            })
            .optional(),
          params: z
            .object({
              id: z.guid()
            })
            .optional(),
          query: z
            .object({
              q: z.string().optional()
            })
            .optional()
        })
      ),
      (request: Request, response: Response) => {
        response.status(201).json(request.body);
      }
    );

    test('should validate body', () => {
      return request(app)
        .post(testRoute)
        .send({ name: '1234' })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should validate header', () => {
      return request(app)
        .post(testRoute)
        .set('Custom-Header', '123456789')
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should validate params', () => {
      return request(app)
        .post('/validate/not-uuid')
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should validate query', () => {
      return request(app)
        .post(testRoute)
        .query({
          q: 1234
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should pass and sanitize input', async () => {
      await request(app)
        .post(testRoute)
        .send({
          name: '12345',
          should: 'be removed'
        })
        .expect(constants.HTTP_STATUS_CREATED)
        .expect({ name: '12345' });

      await request(app)
        .post(testRoute)
        .send({
          name: '<script>12345</script>67890'
        })
        .expect(constants.HTTP_STATUS_CREATED)
        .expect({ name: '67890' });
    });
  });
});
