import bodyParser from 'body-parser';
import { describe, test } from 'vitest';
import express, { Request, Response } from 'express';
import { constants } from 'http2';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import validator from '../validator';

describe('Validator middleware', () => {
  describe('Integration test', () => {
    const testRoute = `/validate/${uuidv4()}`;
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.post(
      '/validate/:id',
      validator.validate(
        z.object({
          body: z
            .object({
              name: z.string().min(5),
            })
            .optional(),
          header: z
            .object({
              'custom-header': z.string().min(10).optional(),
            })
            .optional(),
          params: z
            .object({
              id: z.string().uuid(),
            })
            .optional(),
          query: z
            .object({
              q: z.string().optional(),
            })
            .optional(),
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
          q: 1234,
        })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    test('should pass and sanitize input', async () => {
      await request(app)
        .post(testRoute)
        .send({
          name: '12345',
          should: 'be removed',
        })
        .expect(constants.HTTP_STATUS_CREATED)
        .expect({ name: '12345' });
    });
  });
});
