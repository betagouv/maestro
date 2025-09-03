import {
  extendZodWithOpenApi,
  OpenApiGeneratorV31,
  OpenAPIRegistry
} from '@asteasolutions/zod-to-openapi';
import { Brand } from 'maestro-shared/constants';
import { User } from 'maestro-shared/schema/User/User';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const getOpenApiSchema = (): OpenAPIObject => {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    description: 'Trouve un utilisateur par son identifiant unique',
    summary: 'getUserById',
    request: {
      params: z.object({ userId: z.guid() })
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
      title: `${Brand} API`
    },
    openapi: ''
  });
};
