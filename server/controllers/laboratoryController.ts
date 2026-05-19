import { LaboratoryAnalyticalCompetence } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { v4 as uuidv4 } from 'uuid';
<<<<<<< HEAD
import { HttpStatus } from '../constants/httpStatus';
=======
>>>>>>> 191bac42 (Gestion des lignes à vérifier)
import { laboratoryAgreementCheckRepository } from '../repositories/laboratoryAgreementCheckRepository';
import { laboratoryAgreementRepository } from '../repositories/laboratoryAgreementRepository';
import laboratoryAnalyticalCompetenceRepository from '../repositories/laboratoryAnalyticalCompetenceRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';

export const laboratoriesRouter = {
  '/laboratories/agreements': {
    get: async ({ query }) => {
      console.info('Find all laboratory agreements');

      const agreements = await laboratoryAgreementRepository.findMany(query);

      return { status: HttpStatus.OK, response: agreements };
    }
  },
  '/laboratories/agreements/checks': {
    get: async ({ query }) => {
      console.info('Find all laboratory agreement checks');

      const checks = await laboratoryAgreementCheckRepository.findMany(
        query.year
      );

      return { status: HttpStatus.OK, response: checks };
    },
    put: async ({ body, user }) => {
      console.info('Update laboratory agreement check');

      const checks = await laboratoryAgreementCheckRepository.upsert(
        body,
        user.id
      );

      return { status: HttpStatus.OK, response: checks };
    }
  },
  '/laboratories/agreements/export': {
    get: async ({ query }, _params, response) => {
      console.info('Export laboratory agreements');

      const [agreements, laboratories, prescriptions] = await Promise.all([
        laboratoryAgreementRepository.findMany(query),
        laboratoryRepository.findMany(),
        prescriptionRepository.findMany({ year: query.year })
      ]);

      const buffer = await excelService.generateLaboratoryAgreementsExportExcel(
        agreements,
        laboratories,
        prescriptions
      );

      const fileName = 'agrements-laboratoires.xlsx';

      response.setHeader(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(fileName)}`
      );
      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      response.setHeader('Content-Length', `${buffer.length}`);

      return { status: HttpStatus.OK, response: buffer };
    }
  },
  '/laboratories/agreements/checks': {
    get: async ({ query }) => {
      console.info('Find all laboratory agreement checks');

      const checks = await laboratoryAgreementCheckRepository.findMany(
        query.year
      );

      return { status: constants.HTTP_STATUS_OK, response: checks };
    },
    put: async ({ body, user }) => {
      console.info('Update laboratory agreement check');

      const checks = await laboratoryAgreementCheckRepository.upsert(
        body,
        user.id
      );

      return { status: constants.HTTP_STATUS_OK, response: checks };
    }
  },
  '/laboratories/agreements/export': {
    get: async ({ query }, _params, response) => {
      console.info('Export laboratory agreements');

      const [agreements, laboratories, prescriptions] = await Promise.all([
        laboratoryAgreementRepository.findMany(query),
        laboratoryRepository.findMany(),
        prescriptionRepository.findMany({ year: query.year })
      ]);

      const buffer = await excelService.generateLaboratoryAgreementsExportExcel(
        agreements,
        laboratories,
        prescriptions
      );

      const fileName = 'agrements-laboratoires.xlsx';

      response.setHeader(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(fileName)}`
      );
      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      response.setHeader('Content-Length', `${buffer.length}`);

      return { status: constants.HTTP_STATUS_OK, response: buffer };
    }
  },
  '/laboratories/:laboratoryId/agreements': {
    put: async ({ body }, { laboratoryId }) => {
      console.info('Upsert laboratory agreements', laboratoryId);

      const agreements = await laboratoryAgreementRepository.upsertMany(
        laboratoryId,
        body
      );

      return { status: HttpStatus.OK, response: agreements };
    }
  },
  '/laboratories/:laboratoryId': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory');

      const laboratory = await laboratoryRepository.findUnique(laboratoryId);

      if (!laboratory) {
        return { status: HttpStatus.NOT_FOUND };
      }

      return { status: HttpStatus.OK, response: laboratory };
    }
  },
  '/laboratories/:laboratoryId/config': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory config', laboratoryId);

      const config = await laboratoryRepository.findUnique(laboratoryId);

      return { status: HttpStatus.OK, response: config };
    },
    put: async ({ body }, { laboratoryId }) => {
      console.info('Update laboratory config', laboratoryId);

      await laboratoryRepository.updateConfig(laboratoryId, body);

      return { status: HttpStatus.OK };
    }
  },
  '/laboratories': {
    get: async ({ query }) => {
      console.info('Find laboratories');

      const laboratories = await laboratoryRepository.findMany(query);

      return { status: HttpStatus.OK, response: laboratories };
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
        status: HttpStatus.OK,
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
        status: HttpStatus.CREATED,
        response: competencesToCreate
      };
    }
  },
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId':
    {
      put: async ({ body }, { laboratoryId, analyticalCompetenceId }) => {
        console.info(
          'Update laboratory analytical competence',
          laboratoryId,
          analyticalCompetenceId
        );

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
              id: analyticalCompetence.id ?? uuidv4(),
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
          status: HttpStatus.OK,
          response: competencesToUpdate
        };
      }
    },
  '/laboratories/:laboratoryId/analytical-competences/export': {
    get: async (_, { laboratoryId }, response) => {
      console.info('Export laboratory analytical competences', laboratoryId);

      const laboratory = await laboratoryRepository.findUnique(laboratoryId);

      if (!laboratory) {
        return { status: HttpStatus.NOT_FOUND };
      }

      const analyticalCompetences =
        await laboratoryAnalyticalCompetenceRepository.findManyByLaboratoryId(
          laboratoryId
        );

      const fileName = `competences-analytiques-${laboratory.shortName}.xlsx`;

      const buffer =
        await excelService.generateLaboratoryAnalyticCompetencesExportExcel(
          analyticalCompetences
        );

      response.setHeader(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(fileName)}`
      );
      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      response.setHeader('Content-Length', `${buffer.length}`);

      return { status: HttpStatus.OK, response: buffer };
    }
  }
} as const satisfies ProtectedSubRouter;
