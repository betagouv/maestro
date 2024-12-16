import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts/oas31';
import { extendZodWithOpenApi, OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UserInfos } from '../../shared/schema/User/User';
import { z } from 'zod';
extendZodWithOpenApi(z);
export const getOpenApiSchema = (): OpenAPIObject =>{
  const registry = new OpenAPIRegistry();

   registry.register('User', UserInfos)

  //FIXME utiliser le register ?!
  //FIXME supprimer OpenApiBuilder ?!
  const openApiGenerator = new OpenApiGeneratorV31(registry.definitions)
   const compo = openApiGenerator.generateComponents()

  const builder = OpenApiBuilder.create().addOpenApiVersion('3.1.0')
    .addTitle('Maestro API')
    .addPath('/users/{userId}/infos', {
          get: {
            summary: "Trouve un utilisateur par son id",
            operationId: "getUserById" ,
            parameters:[
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "description": "L'identifiant de l'utilisateur",
            "schema": {
              "type": "string"
            }
          }
        ],
          }
        })
    .getSpec()




  return {...builder, ...compo}

}