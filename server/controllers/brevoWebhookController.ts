import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '../constants/httpStatus';
import { tchapService } from '../services/tchapService';

const BrevoWebhookPayload = z.object({
  event: z.string(),
  email: z.string().optional(),
  reason: z.string().optional()
});

export const brevoWebhook = async (
  request: Request,
  response: Response
): Promise<void> => {
  const parsed = BrevoWebhookPayload.safeParse(request.body);
  if (!parsed.success) {
    response.sendStatus(HttpStatus.BAD_REQUEST);
    return;
  }

  const { event, email, reason } = parsed.data;

  await tchapService.send(
    `[Maestro] Problème de délivrabilité email (${event}) vers ${email ?? '?'}${
      reason ? ` : ${reason}` : ''
    }`
  );

  response.sendStatus(HttpStatus.NO_CONTENT);
};
