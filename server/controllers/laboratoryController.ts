import { constants } from 'http2';
import laboratoryAnalyticalCompetenceRepository from '../repositories/laboratoryAnalyticalCompetenceRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const laboratoriesRouter = {
  '/laboratories/:laboratoryId': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory');

      const laboratory = await laboratoryRepository.findUnique(laboratoryId);

      if (!laboratory) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return { status: constants.HTTP_STATUS_OK, response: laboratory };
    }
  },
  '/laboratories': {
    get: async ({ query }) => {
      console.info('Find laboratories');

      const laboratories = await laboratoryRepository.findMany(query);

      return { status: constants.HTTP_STATUS_OK, response: laboratories };
    }
  },
  '/laboratories/:laboratoryId/analytical-competences': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory analytical competences', laboratoryId);

      const analyticalCompetences =
        await laboratoryAnalyticalCompetenceRepository.findManyByLaboratoryId(
          laboratoryId
        );

      return {
        status: constants.HTTP_STATUS_OK,
        response: analyticalCompetences
      };
    }
  },
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId':
    {
      put: async ({ body }, { laboratoryId, analyticalCompetenceId }) => {
        console.info('Update laboratory analytical competence', laboratoryId);

        const competence = {
          ...body,
          id: analyticalCompetenceId,
          laboratoryId
        };

        await laboratoryAnalyticalCompetenceRepository.update(competence);

        return {
          status: constants.HTTP_STATUS_OK,
          response: competence
        };
      }
    }
} as const satisfies ProtectedSubRouter;
