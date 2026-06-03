import { HttpStatus } from '../constants/httpStatus';
import { analysisRaiRepository } from '../repositories/analysisRaiRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { replayRai as replaySftpRai } from '../services/ediSacha/sftpService';
import { replayRai as replayEmailRai } from '../services/imapService';

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
      try {
        if (rai.source === 'EMAIL') {
          await replayEmailRai(rai);
        } else {
          await replaySftpRai(rai);
        }
      } catch (e: any) {
        await analysisRaiRepository.update(rai.id, {
          state: 'ERROR',
          message: e?.message ?? 'Erreur inconnue'
        });
      }
      return { status: HttpStatus.NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
