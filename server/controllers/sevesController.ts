import { constants } from 'node:http2';
import type { Request, Response } from 'express';
import z from 'zod';

const sevesBody = z.object({
  maestro_reference: z.string(),
  seves_id: z.string(),
  seves_numero: z.string()
});

export const updateSevesReference = async (
  request: Request,
  response: Response
): Promise<void> => {
  console.info('Adding SEVES reference...');

  const { data, error } = sevesBody.safeParse(request.body);
  if (error) {
    response.status(constants.HTTP_STATUS_BAD_REQUEST).send(error);
    return;
  }

  console.log(data);
  //TODO récupérer l'analyse / prélèvement
  //TODO à voir ce qu'on doit mettre à jour, le prélèvement, l'échantillon ou l'analyse ?

  //TODO ajouter un test

  response.status(constants.HTTP_STATUS_OK).send(undefined);
};
