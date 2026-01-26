import { constants } from 'http2';
import { LaboratoryAnalyticalCompetence } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { v4 as uuidv4 } from 'uuid';
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
    },
    post: async ({ body }, { laboratoryId }) => {
      console.info('Create laboratory analytical competence', laboratoryId);

      const { analyteAnalyticalCompetences, ...analyteCompetence } = body;

      const competencesToCreate = [
        {
          ...analyteCompetence,
          id: uuidv4(),
          laboratoryId,
          lastUpdatedAt: new Date()
        },
        ...(analyteAnalyticalCompetences || []).map((analyticalCompetence) => ({
          ...analyticalCompetence,
          id: uuidv4(),
          laboratoryId,
          lastUpdatedAt: new Date()
        }))
      ];

      await laboratoryAnalyticalCompetenceRepository.insertMany(
        competencesToCreate.map((_) => LaboratoryAnalyticalCompetence.parse(_))
      );

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: competencesToCreate
      };
    }
  },
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId':
    {
      put: async ({ body }, { laboratoryId, analyticalCompetenceId }) => {
        console.info('Update laboratory analytical competence', laboratoryId);

        const { analyteAnalyticalCompetences, ...analyteCompetence } = body;

        const competencesToUpdate = [
          {
            ...analyteCompetence,
            id: analyticalCompetenceId,
            laboratoryId,
            lastUpdatedAt: new Date()
          },
          ...(analyteAnalyticalCompetences || []).map(
            (analyticalCompetence) => ({
              ...analyticalCompetence,
              laboratoryId,
              lastUpdatedAt: new Date()
            })
          )
        ];

        await Promise.all(
          competencesToUpdate.map((competence) =>
            laboratoryAnalyticalCompetenceRepository.update(
              LaboratoryAnalyticalCompetence.parse(competence)
            )
          )
        );

        return {
          status: constants.HTTP_STATUS_OK,
          response: competencesToUpdate
        };
      }
    }
} as const satisfies ProtectedSubRouter;
