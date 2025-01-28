import {
  extendZodWithOpenApi,
  OpenApiGeneratorV31,
  OpenAPIRegistry
} from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { z } from 'zod';
import { User } from '../../shared/schema/User/User';

extendZodWithOpenApi(z);

export const getOpenApiSchema = (): OpenAPIObject => {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    description: 'Trouve un utilisateur par son identifiant unique',
    summary: 'getUserById',
    request: {
      params: z.object({ userId: z.string().uuid() })
    },
    responses: {
      200: {
        description: 'Utilisateur aves ses informations',
        content: {
          'application/json': {
            schema: User
          }
        }
      }
    }
  });

  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions);

  return openApiGenerator.generateDocument({
    info: {
      version: 'v1',
      title: 'Maestro API'
    },
    openapi: ''
  });
};
