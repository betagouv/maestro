import { constants } from 'node:http2';
import type { Request, Response } from 'express';
import { Seves } from 'maestro-shared/schema/Sample/Seves';
import { z } from 'zod';
import { sampleRepository } from '../repositories/sampleRepository';

const sevesBody = z.object({
  maestro_reference: z.string(),
  seves_id: Seves.shape.id,
  seves_numero: Seves.shape.numero
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

  const updatedCount = await sampleRepository.updateSeves(
    data.maestro_reference,
    { id: data.seves_id, numero: data.seves_numero }
  );

  if (updatedCount === 0) {
    response.status(constants.HTTP_STATUS_NOT_FOUND).send(undefined);
    return;
  }

  response.status(constants.HTTP_STATUS_OK).send(undefined);
};
