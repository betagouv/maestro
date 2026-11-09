import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  type LaboratoryAgreementRowKey,
  subPlanNumbersMissingAgreements
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { stagesFromSubPlans } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { HttpStatus } from '../constants/httpStatus';
import { laboratoryAgreementCheckRepository } from '../repositories/laboratoryAgreementCheckRepository';
import laboratoryAgreementDiffusionRepository from '../repositories/laboratoryAgreementDiffusionRepository';
import { laboratoryAgreementRepository } from '../repositories/laboratoryAgreementRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import localPrescriptionSubstanceKindLaboratoryRepository from '../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';
import { importPublicKey } from '../services/gpgService';
import { notificationService } from '../services/notificationService';

const diffusedYears = async (): Promise<number[]> =>
  (await laboratoryAgreementDiffusionRepository.findMany()).map(
    (diffusion) => diffusion.year
  );

const notifyLaboratoryAgreementLost = async (
  laboratoryId: string,
  rowKey: LaboratoryAgreementRowKey
) => {
  const [laboratory, scopes] = await Promise.all([
    laboratoryRepository.findUnique(laboratoryId),
    localPrescriptionSubstanceKindLaboratoryRepository.findAgreementScopes(
      laboratoryId,
      rowKey.programmingSubPlanId,
      rowKey.substanceKind
    )
  ]);

  if (!laboratory || scopes.length === 0) {
    return;
  }

  for (const scope of scopes) {
    const plan = await programmingPlanRepository.findUnique(
      scope.programmingPlanId
    );
    if (!plan) {
      continue;
    }

    const recipients = await userRepository.findMany({
      roles: [
        scope.department ? 'DepartmentalCoordinator' : 'RegionalCoordinator'
      ],
      region: scope.region,
      department: scope.department,
      disabled: false,
      stages: stagesFromSubPlans(plan.subPlans)
    });

    if (recipients.length === 0) {
      continue;
    }

    await notificationService.sendNotification(
      {
        category: 'LaboratoryAgreementLost',
        link: AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          programmingPlanIds: [plan.id]
        })
      },
      recipients,
      {
        object: `Campagne PSPC ${plan.year} / Perte d’agrément d’un ou plusieurs laboratoires`,
        content: `Le ou les laboratoires suivants ont perdu leur agrément sur un ou plusieurs sous-plans de votre programmation ${plan.year} :
• ${laboratory.shortName} (${laboratory.name})

Pour les sous-plans concernés vous devez attribuer un nouveau laboratoire pour que les prélèvements puissent continuer à être saisis.`
      },
      {
        message: `Perte d’agrément du ${laboratory.shortName} sur un ou plusieurs sous-plans`
      }
    );
  }
};

export const laboratoriesRouter = {
  '/laboratories/agreements': {
    get: async ({ query, userRole }) => {
      console.info('Find all laboratory agreements');

      if (!hasPermission(userRole, 'readUndiffusedLaboratoryAgreements')) {
        const years = await diffusedYears();
        if (!query.year || !years.includes(query.year)) {
          return { status: HttpStatus.FORBIDDEN };
        }
      }

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
    get: async ({ query, userRole }, _params, response) => {
      console.info('Export laboratory agreements');

      if (!hasPermission(userRole, 'readUndiffusedLaboratoryAgreements')) {
        const years = await diffusedYears();
        if (!query.year || !years.includes(query.year)) {
          return { status: HttpStatus.FORBIDDEN };
        }
      }

      const [agreements, laboratories] = await Promise.all([
        laboratoryAgreementRepository.findMany(query),
        laboratoryRepository.findMany()
      ]);

      const buffer = await excelService.generateLaboratoryAgreementsExportExcel(
        agreements,
        laboratories
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
  '/laboratories/agreements/sub-plans': {
    get: async ({ query: { year }, userRole }) => {
      console.info('Find laboratory agreement sub-plans', year);

      if (!hasPermission(userRole, 'readUndiffusedLaboratoryAgreements')) {
        const years = await diffusedYears();
        if (!years.includes(year)) {
          return { status: HttpStatus.FORBIDDEN };
        }
      }

      const subPlans =
        await programmingSubPlanRepository.findManyWithPlan(year);

      return { status: HttpStatus.OK, response: subPlans };
    }
  },
  '/laboratories/agreements/diffusions': {
    get: async () => {
      console.info('Find laboratory agreement diffusions');

      const diffusions =
        await laboratoryAgreementDiffusionRepository.findMany();

      return { status: HttpStatus.OK, response: diffusions };
    },
    post: async ({ body: { year }, user }) => {
      console.info('Diffuse laboratory agreements', year);

      const existing =
        await laboratoryAgreementDiffusionRepository.findUnique(year);
      if (existing) {
        return { status: HttpStatus.OK, response: existing };
      }

      const [programmingPlans, agreements] = await Promise.all([
        programmingPlanRepository.findMany({ year }),
        laboratoryAgreementRepository.findMany({ year })
      ]);

      const missingSubPlanNumbers = subPlanNumbersMissingAgreements(
        programmingPlans.flatMap((programmingPlan) => programmingPlan.subPlans),
        agreements
      );

      if (missingSubPlanNumbers.length > 0) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const diffusion = await laboratoryAgreementDiffusionRepository.insert(
        year,
        user.id
      );

      return { status: HttpStatus.OK, response: diffusion };
    }
  },
  '/laboratories/:laboratoryId/agreements': {
    put: async ({ body }, { laboratoryId }) => {
      console.info('Upsert laboratory agreements', laboratoryId);

      const isAgreementLost =
        !body.referenceLaboratory &&
        !body.detectionAnalysis &&
        !body.confirmationAnalysis;

      const previousAgreements = isAgreementLost
        ? await laboratoryAgreementRepository.findMany({
            laboratoryIds: [laboratoryId],
            programmingSubPlanIds: [
              body.laboratoryAgreementRowKey.programmingSubPlanId
            ],
            substanceKinds: [body.laboratoryAgreementRowKey.substanceKind]
          })
        : [];

      const agreements = await laboratoryAgreementRepository.upsertMany(
        laboratoryId,
        body
      );

      if (isAgreementLost && previousAgreements.length > 0) {
        await notifyLaboratoryAgreementLost(
          laboratoryId,
          body.laboratoryAgreementRowKey
        );
      }

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

      const previousConfig =
        await laboratoryRepository.findUnique(laboratoryId);

      await laboratoryRepository.updateConfig(laboratoryId, body);

      const previousCommunication = previousConfig?.sacha?.communication;
      const previousGpgPublicKey =
        previousCommunication?.method === 'EMAIL'
          ? previousCommunication.gpgPublicKey
          : null;

      if (
        body.sacha?.communication?.method === 'EMAIL' &&
        body.sacha.communication.gpgPublicKey &&
        body.sacha.communication.gpgPublicKey !== previousGpgPublicKey
      ) {
        await importPublicKey(body.sacha.communication.gpgPublicKey);
      }

      return { status: HttpStatus.OK };
    }
  },
  '/laboratories': {
    get: async ({ query }) => {
      console.info('Find laboratories');

      const laboratories = await laboratoryRepository.findMany(query);

      return { status: HttpStatus.OK, response: laboratories };
    }
  }
} as const satisfies ProtectedSubRouter;
