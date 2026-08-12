import { HttpStatus } from '../constants/httpStatus';
import { analysisRaiRepository } from '../repositories/analysisRaiRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { RaiLabError } from '../services/ediSacha/sachaErrors';
import { replayRai as replaySftpRai } from '../services/ediSacha/sftpService';
import { replayRai as replayEmailRai } from '../services/imapService';
import { ExtractLabError } from '../services/imapService/extractError';

export const analysisRaiRouter = {
  '/analysis-rai': {
    get: async ({ query }) => {
      const result = await analysisRaiRepository.findManyWithRelations(query);
      return { status: HttpStatus.OK, response: result };
    }
  },
  '/analysis-rai/:analysisRaiId/replay': {
    post: async (_req, { analysisRaiId }) => {
      const rai = await analysisRaiRepository.findById(analysisRaiId);
      if (!rai) {
        return { status: HttpStatus.NOT_FOUND };
      }
      if (rai.state !== 'INTERNAL_ERROR' && rai.state !== 'REJECTED') {
        return { status: HttpStatus.CONFLICT };
      }
      try {
        if (rai.source === 'EMAIL') {
          await replayEmailRai(rai);
        } else {
          await replaySftpRai(rai);
        }
      } catch (e: any) {
        const isLabError =
          e instanceof ExtractLabError || e instanceof RaiLabError;
        await analysisRaiRepository.update(rai.id, {
          state: isLabError ? 'REJECTED' : 'INTERNAL_ERROR',
          message: e?.message ?? 'Erreur inconnue'
        });
      }
      return { status: HttpStatus.NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
