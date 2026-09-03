import { groupBy, intersection, isNil } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import type { Department } from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { NotificationCategoryTitles } from 'maestro-shared/schema/Notification/NotificationCategory';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  hasSentOnward,
  type ProgrammingPlanEchelon
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import {
  NextProgrammingPlanStatus,
  type ProgrammingPlanStatus,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { stagesFromSubPlans } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';

import {
  hasPermission,
  stagesIsRequired,
  type UserRefined,
  userDepartmentsForRole,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  editingEchelonForRole,
  isNationalRole,
  isRegionalRole,
  type UserRole
} from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import { programmingPlanDomainRepository } from '../repositories/programmingPlanDomainRepository.ts';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';
import prescriptionDiffusionService from '../services/prescriptionDiffusionService';

const planBatches = (
  plans: ProgrammingPlanChecked[]
): ProgrammingPlanChecked[][] =>
  Object.values(
    groupBy(
      plans,
      (plan) =>
        `${plan.year}|${stagesFromSubPlans(plan.subPlans).sort().join(',')}`
    )
  );

const batchStages = (plans: ProgrammingPlanChecked[]) =>
  stagesFromSubPlans(plans.flatMap((plan) => plan.subPlans));

const batchLink = (plans: ProgrammingPlanChecked[], tab?: 'PlanTrackingTab') =>
  AppRouteLinks.ProgrammingRoute.link({
    year: plans[0].year,
    planIds: plans.map((plan) => plan.id).join(','),
    ...(tab ? { tab } : {})
  });

const readyForAdminReviewMessage = (year: number, author: string) =>
  `Un ou plusieurs sous-plans viennent d’être ajoutés par ${author} pour la campagne ${year}.`;

const readyForAdminReviewParams = (year: number, author: string) => ({
  object: `Campagne PSPC ${year} / Nouveau(x) sous-plan(s) disponible(s) pour soumission aux régions`,
  content: `${readyForAdminReviewMessage(year, author)} Vous pouvez maintenant les soumettre aux régions.`
});

const modifiedAuthors = {
  National: {
    inApp: 'la coordination nationale',
    content: 'la coordination nationale'
  },
  Regional: {
    inApp: 'la coordination régionale',
    content: 'votre coordinateur ou coordinatrice régionale'
  },
  Departmental: {
    inApp: 'la coordination départementale',
    content: 'votre coordinateur ou coordinatrice départementale'
  }
} as const satisfies Record<
  ProgrammingPlanEchelon,
  { inApp: string; content: string }
>;

const modifiedMessage = (year: number, echelon: ProgrammingPlanEchelon) =>
  `Modification sur un ou plusieurs sous-plans de la campagne ${year} par ${modifiedAuthors[echelon].inApp}`;

const modifiedParams = (year: number, echelon: ProgrammingPlanEchelon) => ({
  object: `Campagne PSPC ${year} / Modification sur un ou plusieurs sous-plans`,
  content: `Un ou plusieurs sous-plans ont été modifiés par ${modifiedAuthors[echelon].content} pour la campagne ${year}.
Ces modifications apparaissent en jaune jusqu’à ce qu’elles soient traitées par un utilisateur ou une utilisatrice. Si vous ne les voyez pas en arrivant sur Maestro, c’est qu’elles ont déjà été traitées.`
});

const submittedToRegionMessage = (year: number) =>
  `Nouveau(x) sous-plans disponibles pour la campagne ${year}.`;

const submittedToRegionParams = (year: number) => ({
  object: `Campagne PSPC ${year} / Nouveau(x) sous-plan(s) disponible(s) pour répartition départementale`,
  content: `Un ou plusieurs sous-plans viennent d’être ajoutés par la coordination nationale pour la campagne ${year}. Vous pouvez maintenant renseigner la répartition départementale.`
});

const submittedToDepartmentsMessage = (year: number) =>
  `Un ou plusieurs sous-plans viennent d’être complétés par votre coordinateur ou coordinatrice régionale pour la campagne ${year}.`;

const submittedToDepartmentsParams = (year: number) => ({
  object: `Campagne PSPC ${year} / Nouveau(x) sous-plan(s) disponible(s)`,
  content: `Un ou plusieurs sous-plans viennent d’être complétés par votre coordinateur ou coordinatrice régionale pour la campagne ${year}. Vous pouvez maintenant faire l’attribution des laboratoires et la répartition entre abattoirs (pour les plans à l’abattoir) puis les diffuser aux préleveurs et préleveuses.
Si la campagne sur ces sous-plans a déjà été lancée par la coordination nationale, ils seront directement visibles par eux.`
});

const notifyCampaignLaunch = async (plans: ProgrammingPlanChecked[]) => {
  const domains = await programmingPlanDomainRepository.findMany();
  const planLabel = (plan: ProgrammingPlanChecked) => {
    const domain = domains.find((_) => _.id === plan.domainId);
    return domain ? `${domain.label} / ${plan.title}` : plan.title;
  };

  const year = plans[0].year;
  const stages = stagesFromSubPlans(plans.flatMap((plan) => plan.subPlans));
  const planLines = plans.map((plan) => `• ${planLabel(plan)}`).join('\n');
  const planIds = plans.map((plan) => plan.id).join(',');
  const inAppMessage = `Lancement de la campagne ${year} sur un ou plusieurs plans`;

  const coordinators = await userRepository.findMany({
    roles: [
      'NationalCoordinator',
      'NationalObserver',
      'RegionalCoordinator',
      'DepartmentalCoordinator'
    ],
    disabled: false,
    stages
  });

  await notificationService.sendNotification(
    {
      category: 'ProgrammingPlanCampaignLaunched',
      link: AppRouteLinks.ProgrammingRoute.link({
        year,
        planIds,
        tab: 'PlanTrackingTab'
      })
    },
    coordinators,
    {
      object: `Campagne PSPC ${year} / Lancement de la campagne sur un ou plusieurs plans`,
      content: `La coordination nationale vient de lancer la campagne PSPC ${year} sur les plans suivants :
${planLines}

Les préleveurs et préleveuses peuvent dès à présent saisir des prélèvements sur ces plans si l’attribution des laboratoires et la répartition par abattoir pour les plans à l’abattoir, ont été faites.`
    },
    { message: inAppMessage }
  );

  const samplerScopes = new Map<
    string,
    { region: Region; department?: Department; plans: ProgrammingPlanChecked[] }
  >();

  for (const plan of plans) {
    const validatedScopes =
      plan.distributionKind === 'SLAUGHTERHOUSE'
        ? plan.departmentalStatus
            .filter((_) => _.status === 'Validated')
            .map((_) => ({
              region: _.region as Region,
              department: _.department as Department
            }))
        : plan.regionalStatus
            .filter((_) => _.status === 'Validated')
            .map((_) => ({
              region: _.region as Region,
              department: undefined
            }));

    for (const scope of validatedScopes) {
      const key = `${scope.region}-${scope.department ?? 'None'}`;
      const existing = samplerScopes.get(key);
      if (existing) {
        existing.plans.push(plan);
      } else {
        samplerScopes.set(key, { ...scope, plans: [plan] });
      }
    }
  }

  for (const scope of samplerScopes.values()) {
    const samplers = await userRepository.findMany({
      roles: ['Sampler'],
      region: scope.region,
      department: scope.department,
      disabled: false,
      stages: stagesFromSubPlans(scope.plans.flatMap((plan) => plan.subPlans))
    });

    if (samplers.length === 0) {
      continue;
    }

    await notificationService.sendNotification(
      {
        category: 'ProgrammingPlanCampaignLaunched',
        link: AppRouteLinks.ProgrammingRoute.link({
          year,
          planIds: scope.plans.map((plan) => plan.id).join(',')
        })
      },
      samplers,
      {
        object: `Campagne PSPC ${year} / Lancement de la campagne sur un ou plusieurs plans`,
        content: `La campagne PSPC ${year} vient d’être lancée sur les plans suivants :
${scope.plans.map((plan) => `- ${planLabel(plan)}`).join('\n')}

Vous pouvez dès à présent saisir des prélèvements sur ces plans.`
      },
      { message: inAppMessage }
    );
  }
};

const maskHasPendingChangeForViewer = (
  plan: ProgrammingPlanChecked,
  userRole: UserRole,
  user: UserRefined
): ProgrammingPlanChecked => {
  const viewerEchelon = editingEchelonForRole(userRole);
  const isOwner = (
    echelon: ProgrammingPlanEchelon,
    region?: string,
    department?: string
  ) =>
    viewerEchelon === echelon &&
    (echelon !== 'Regional' || user.region === region) &&
    (echelon !== 'Departmental' ||
      (user.region === region && user.department === department));

  return {
    ...plan,
    nationalStatus: {
      ...plan.nationalStatus,
      hasPendingChange: isOwner('National')
        ? plan.nationalStatus.hasPendingChange
        : false
    },
    regionalStatus: plan.regionalStatus.map((regionalStatus) => ({
      ...regionalStatus,
      hasPendingChange: isOwner('Regional', regionalStatus.region)
        ? Boolean(regionalStatus.hasPendingChange || regionalStatus.needsResend)
        : false
    })),
    departmentalStatus: plan.departmentalStatus.map((departmentalStatus) => ({
      ...departmentalStatus,
      hasPendingChange: isOwner(
        'Departmental',
        departmentalStatus.region,
        departmentalStatus.department
      )
        ? Boolean(
            departmentalStatus.hasPendingChange ||
              departmentalStatus.needsResend
          )
        : false
    }))
  };
};

export const programmingPlanRouter = {
  '/programming-plans': {
    get: async ({ query: findOptions, user, userRole }) => {
      console.info('Find programmingPlans for user', user.id, findOptions);

      const userLaboratory =
        userRole === 'LaboratoryUser'
          ? await laboratoryRepository.findUnique(user.laboratoryId as string)
          : undefined;

      const programmingPlans = await programmingPlanRepository.findMany(
        buildFindProgrammingPlanOptions(
          user,
          userRole,
          findOptions,
          userLaboratory
        )
      );

      console.info('Found programmingPlans', programmingPlans);

      return {
        status: HttpStatus.OK,
        response: programmingPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-regions': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      const readyForAdminReviewPlans: ProgrammingPlanChecked[] = [];
      const submittedToRegionPlans: ProgrammingPlanChecked[] = [];
      const modifiedPlansByRegion = new Map<Region, ProgrammingPlanChecked[]>();

      for (const plan of plans) {
        const isModified = plan.nationalStatus.hasPendingChange === true;
        const isFirstSend = isNil(plan.nationalStatus.sentAt);

        if (userRole === 'NationalCoordinator') {
          await prescriptionDiffusionService.commitPendingNationalChanges(
            plan.id
          );
        }

        if (userRole === 'NationalCoordinator' && isFirstSend) {
          await programmingPlanRepository.updateNationalStatus(
            plan.id,
            'SubmittedToAdmin',
            plan.distributionKind
          );

          readyForAdminReviewPlans.push(plan);
          continue;
        }

        if (userRole === 'AdministratorBGIR' && isModified) {
          continue;
        }

        if (
          userRole === 'AdministratorBGIR' &&
          plan.nationalStatus.status !== 'SubmittedToAdmin'
        ) {
          continue;
        }

        if (userRole === 'AdministratorBGIR') {
          await Promise.all(
            plan.regionalStatus.map((regionalStatus) =>
              programmingPlanRepository.updateLocalStatus(
                plan.id,
                { region: regionalStatus.region, status: 'SubmittedToRegion' },
                plan.distributionKind
              )
            )
          );
          await programmingPlanRepository.updateNationalStatus(
            plan.id,
            'SubmittedToRegion',
            plan.distributionKind
          );

          submittedToRegionPlans.push(plan);
        } else {
          const previousSentAt = plan.nationalStatus.sentAt as Date;
          await programmingPlanRepository.touchNationalSentAt(plan.id);

          const affectedRegions = plan.regionalStatus.filter(
            (regionalStatus) =>
              regionalStatus.lastModifiedAt &&
              regionalStatus.lastModifiedAt > previousSentAt
          );

          for (const affectedRegion of affectedRegions) {
            const region = affectedRegion.region as Region;
            modifiedPlansByRegion.set(region, [
              ...(modifiedPlansByRegion.get(region) ?? []),
              plan
            ]);
          }
        }
      }

      const author = user.name ?? 'la coordination nationale';

      for (const batch of planBatches(readyForAdminReviewPlans)) {
        const admins = await userRepository.findMany({
          roles: ['AdministratorBGIR'],
          disabled: false,
          stages: batchStages(batch)
        });

        await notificationService.sendNotification(
          {
            category: 'ProgrammingPlanReadyForAdminReview',
            link: batchLink(batch)
          },
          admins,
          readyForAdminReviewParams(batch[0].year, author),
          { message: readyForAdminReviewMessage(batch[0].year, author) }
        );
      }

      for (const batch of planBatches(submittedToRegionPlans)) {
        const regionalCoordinators = await userRepository.findMany({
          roles: ['RegionalCoordinator'],
          disabled: false,
          stages: batchStages(batch)
        });

        await notificationService.sendNotification(
          {
            category: 'ProgrammingPlanSubmittedToRegion',
            link: batchLink(batch)
          },
          regionalCoordinators,
          submittedToRegionParams(batch[0].year),
          { message: submittedToRegionMessage(batch[0].year) }
        );

        const laboratoryOffices = await userRepository.findMany({
          roles: ['LaboratoryOffice'],
          disabled: false
        });

        const year = batch[0].year;

        await notificationService.sendNotification(
          {
            category: 'LaboratoryAgreementsToManage',
            link: AppRouteLinks.LaboratoryAgreementsRoute.link()
          },
          laboratoryOffices,
          {
            object: `Campagne PSPC ${year} / Nouveau(x) sous-plan(s) ajoutés`,
            content: `Un ou plusieurs sous-plans ont été ajoutés à la campagne ${year} par le BGIR.
Vous pouvez maintenant gérer l’affectation des laboratoires pour ces sous-plans.`
          },
          {
            message: `Nouveau(x) sous-plan(s) ajoutés à la campagne ${year}. Agréments des laboratoires à gérer.`
          }
        );
      }

      for (const [region, regionPlans] of modifiedPlansByRegion) {
        for (const batch of planBatches(regionPlans)) {
          const regionalCoordinators = await userRepository.findMany({
            roles: ['RegionalCoordinator'],
            region,
            disabled: false,
            stages: batchStages(batch)
          });

          await notificationService.sendNotification(
            {
              category: 'ProgrammingPlanModifiedAfterSubmission',
              link: batchLink(batch)
            },
            regionalCoordinators,
            modifiedParams(batch[0].year, 'National'),
            { message: modifiedMessage(batch[0].year, 'National') }
          );
        }
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/launch-campaign': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      console.info('Launch campaign on programming plans', programmingPlanIds);

      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });
      const launchedPlans = plans.filter((plan) => isNil(plan.launchedAt));

      await programmingPlanRepository.launch(programmingPlanIds, user.id);

      if (launchedPlans.length > 0) {
        await notifyCampaignLaunch(launchedPlans);
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-departments': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const region = user.region as Region;
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      const submittedToDepartmentsPlans: ProgrammingPlanChecked[] = [];
      const modifiedPlans: ProgrammingPlanChecked[] = [];

      for (const plan of plans) {
        const regionalStatus = plan.regionalStatus.find(
          (_) => _.region === region
        );
        if (!regionalStatus) {
          continue;
        }

        const isModified =
          regionalStatus.hasPendingChange === true ||
          regionalStatus.needsResend === true;
        const isFirstSend = regionalStatus.status === 'SubmittedToRegion';

        if (plan.distributionKind === 'REGIONAL') {
          continue;
        }

        await prescriptionDiffusionService.commitPendingRegionalChanges(
          plan.id,
          region,
          plan.distributionKind
        );

        if (isFirstSend) {
          await programmingPlanRepository.insertManyLocalStatus(
            plan.id,
            Regions[region].departments.map((department) => ({
              region,
              department,
              status: 'SubmittedToDepartments' as const
            }))
          );
          await programmingPlanRepository.updateLocalStatus(
            plan.id,
            { region, status: 'SubmittedToDepartments' },
            plan.distributionKind
          );

          submittedToDepartmentsPlans.push(plan);
        } else if (isModified) {
          const previousSentAt = regionalStatus.sentAt as Date;
          await programmingPlanRepository.touchRegionalSentAt(plan.id, region);

          const affectedDepartments = plan.departmentalStatus.filter(
            (departmentalStatus) =>
              departmentalStatus.region === region &&
              departmentalStatus.lastModifiedAt &&
              departmentalStatus.lastModifiedAt > previousSentAt
          );

          if (affectedDepartments.length > 0) {
            modifiedPlans.push(plan);
          }
        }
      }

      for (const batch of planBatches(submittedToDepartmentsPlans)) {
        const departmentalCoordinators = await userRepository.findMany({
          roles: ['DepartmentalCoordinator'],
          region,
          disabled: false,
          stages: batchStages(batch)
        });

        await notificationService.sendNotification(
          {
            category: 'ProgrammingPlanSubmittedToDepartments',
            link: batchLink(batch)
          },
          departmentalCoordinators,
          submittedToDepartmentsParams(batch[0].year),
          { message: submittedToDepartmentsMessage(batch[0].year) }
        );
      }

      for (const batch of planBatches(modifiedPlans)) {
        const departmentalCoordinators = await userRepository.findMany({
          roles: ['DepartmentalCoordinator'],
          region,
          disabled: false,
          stages: batchStages(batch)
        });

        await notificationService.sendNotification(
          {
            category: 'ProgrammingPlanModifiedAfterSubmission',
            link: batchLink(batch)
          },
          departmentalCoordinators,
          modifiedParams(batch[0].year, 'Regional'),
          { message: modifiedMessage(batch[0].year, 'Regional') }
        );
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-samplers': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const region = user.region as Region;
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        if (plan.distributionKind !== 'REGIONAL') {
          continue;
        }

        const regionalStatus = plan.regionalStatus.find(
          (_) => _.region === region
        );
        if (!regionalStatus) {
          continue;
        }

        const link = AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          planIds: plan.id
        });
        const isModified =
          regionalStatus.hasPendingChange === true ||
          regionalStatus.needsResend === true;

        await prescriptionDiffusionService.commitPendingRegionalChanges(
          plan.id,
          region,
          plan.distributionKind
        );

        const samplers = await userRepository.findMany({
          roles: ['Sampler'],
          region,
          disabled: false,
          stages: stagesFromSubPlans(plan.subPlans)
        });

        if (regionalStatus.status === 'SubmittedToRegion') {
          await programmingPlanRepository.updateLocalStatus(
            plan.id,
            { region, status: 'Validated' },
            plan.distributionKind
          );

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanValidated', link },
            samplers,
            {
              object: NotificationCategoryTitles.ProgrammingPlanValidated,
              content: `
L’étape de la répartition de la programmation a été réalisée par votre coordinateur. La campagne est lancée !

Vous pouvez dorénavant consulter la programmation, vous concernant, dans l’onglet "Programmation" et saisir des prélèvements.`
            }
          );
        } else if (
          isModified &&
          hasSentOnward(
            'Regional',
            plan.distributionKind,
            regionalStatus.status
          )
        ) {
          await programmingPlanRepository.touchRegionalSentAt(plan.id, region);

          const nationalCoordinators = await userRepository.findMany({
            roles: ['NationalCoordinator'],
            disabled: false,
            stages: stagesFromSubPlans(plan.subPlans)
          });

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanModifiedAfterSubmission', link },
            nationalCoordinators,
            modifiedParams(plan.year, 'Regional'),
            { message: modifiedMessage(plan.year, 'Regional') }
          );

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanModifiedAfterSubmission', link },
            samplers,
            modifiedParams(plan.year, 'Regional'),
            { message: modifiedMessage(plan.year, 'Regional') }
          );
        }
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/:programmingPlanId': {
    get: async ({ user, userRole }, { programmingPlanId }) => {
      console.info('Get programming plan', programmingPlanId);

      const programmingPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!programmingPlan) {
        throw new ProgrammingPlanMissingError(programmingPlanId);
      }

      if (
        stagesIsRequired(user) &&
        !intersection(
          user.programmingSubPlans.map((sp) => sp.id),
          programmingPlan.subPlans.map((sp) => sp.id)
        ).length
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (userRole === 'Sampler' && isNil(programmingPlan.launchedAt)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(userRole, permission))
        .map(([status]) => status);

      const maskedProgrammingPlan = maskHasPendingChangeForViewer(
        programmingPlan,
        userRole,
        user
      );

      const filterProgrammingPlanStatus =
        isNationalRole(userRole) ||
        isRegionalRole(userRole) ||
        maskedProgrammingPlan.distributionKind === 'REGIONAL'
          ? maskedProgrammingPlan.regionalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region)
            )
          : maskedProgrammingPlan.departmentalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region) &&
                userDepartmentsForRole(user, userRole).includes(_.department)
            );
      if (filterProgrammingPlanStatus.length === 0) {
        return { status: HttpStatus.FORBIDDEN };
      }

      return {
        status: HttpStatus.OK,
        response: {
          ...maskedProgrammingPlan,
          regionalStatus: filterProgrammingPlanStatus
        }
      };
    },
    put: async ({ user, userRole, body }, { programmingPlanId }) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);
      const newProgrammingPlanStatus = body.status;

      console.info(
        'Update programming plan status',
        programmingPlan.id,
        newProgrammingPlanStatus
      );

      if (
        newProgrammingPlanStatus !== 'Closed' ||
        programmingPlan.regionalStatus.some(
          (programmingPlanLocalStatus) =>
            NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlanLocalStatus.status
            ] !== newProgrammingPlanStatus
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      await Promise.all(
        RegionList.map((region) =>
          programmingPlanRepository.updateLocalStatus(
            programmingPlan.id,
            {
              region,
              status: newProgrammingPlanStatus
            },
            programmingPlan.distributionKind
          )
        )
      );

      await programmingPlanRepository.update({
        ...programmingPlan,
        closedAt: new Date(),
        closedBy: user.id
      });

      await sampleRepository.deleteDraftOnProgrammingPlan(programmingPlan.id);

      const updatedProgrammingPlan = await programmingPlanRepository.findUnique(
        programmingPlan.id
      );

      if (!updatedProgrammingPlan) {
        throw new Error('Programming plan not found after update');
      }
      return {
        status: HttpStatus.OK,
        response: maskHasPendingChangeForViewer(
          updatedProgrammingPlan,
          userRole,
          user
        )
      };
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId': {
    put: async ({ body }, { programmingPlanId, programmingSubPlanId }) => {
      console.info('Update programming sub-plan', programmingSubPlanId);

      const programmingSubPlan =
        await programmingSubPlanRepository.findUnique(programmingSubPlanId);

      if (
        !programmingSubPlan ||
        programmingSubPlan.programmingPlanId !== programmingPlanId
      ) {
        return { status: HttpStatus.NOT_FOUND };
      }

      await programmingSubPlanRepository.update({
        ...programmingSubPlan,
        stages: body.stages
      });

      return { status: HttpStatus.NO_CONTENT };
    }
  },
  '/programming-plans/:programmingPlanId/local-status': {
    put: async (
      { user, userRole, body: { programmingPlanLocalStatusList } },
      { programmingPlanId }
    ) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);

      console.info(
        'Update programming plan regional status',
        programmingPlanId,
        programmingPlanLocalStatusList
      );

      const isValidTransition = (
        programmingPlanLocalStatus: (typeof programmingPlanLocalStatusList)[number]
      ) =>
        (programmingPlanLocalStatus.department
          ? NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlan.departmentalStatus?.find(
                (_) =>
                  _.region === programmingPlanLocalStatus.region &&
                  _.department === programmingPlanLocalStatus.department
              )?.status as ProgrammingPlanStatus
            ]
          : NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlan.regionalStatus.find(
                (_) => _.region === programmingPlanLocalStatus.region
              )?.status as ProgrammingPlanStatus
            ]) === programmingPlanLocalStatus.status;

      const isAllowedDepartmentalReDiffusion = (
        programmingPlanLocalStatus: (typeof programmingPlanLocalStatusList)[number]
      ) =>
        Boolean(programmingPlanLocalStatus.department) &&
        programmingPlanLocalStatus.status === 'Validated' &&
        programmingPlan.departmentalStatus?.some(
          (_) =>
            _.region === programmingPlanLocalStatus.region &&
            _.department === programmingPlanLocalStatus.department &&
            _.status === 'Validated'
        );

      if (
        programmingPlanLocalStatusList.some(
          (programmingPlanLocalStatus) =>
            !userRegionsForRole(user, userRole).includes(
              programmingPlanLocalStatus.region as Region
            ) ||
            (programmingPlanLocalStatus.department &&
              !Regions[user.region as Region].departments.includes(
                programmingPlanLocalStatus.department
              ))
        )
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (
        programmingPlanLocalStatusList.some(
          (programmingPlanLocalStatus) =>
            !isValidTransition(programmingPlanLocalStatus) &&
            !isAllowedDepartmentalReDiffusion(programmingPlanLocalStatus)
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      if (
        programmingPlanLocalStatusList.some(
          (_) => _.status === 'SubmittedToRegion'
        )
      ) {
        await prescriptionDiffusionService.commitPendingNationalChanges(
          programmingPlanId
        );
      }

      const regionsDiffusing = new Set(
        programmingPlanLocalStatusList
          .filter(
            (_) =>
              !_.department &&
              (_.status === 'SubmittedToDepartments' ||
                (_.status === 'Validated' &&
                  programmingPlan.distributionKind === 'REGIONAL'))
          )
          .map((_) => _.region as Region)
      );
      for (const region of regionsDiffusing) {
        await prescriptionDiffusionService.commitPendingRegionalChanges(
          programmingPlanId,
          region,
          programmingPlan.distributionKind
        );
      }

      const departmentsLaunchingCampaign =
        programmingPlanLocalStatusList.filter(
          (_) => _.department && _.status === 'Validated'
        ) as { region: Region; department: Department; status: 'Validated' }[];
      for (const { region, department } of departmentsLaunchingCampaign) {
        await prescriptionDiffusionService.commitPendingDepartmentalChanges(
          programmingPlanId,
          region,
          department
        );
      }

      await Promise.all(
        programmingPlanLocalStatusList.map(
          async (programmingPlanLocalStatus) => {
            const link = AppRouteLinks.ProgrammingRoute.link({
              year: programmingPlan.year,
              planIds: programmingPlan.id
            });

            if (
              programmingPlanLocalStatus.department &&
              programmingPlanLocalStatus.status === 'Validated'
            ) {
              const isRedeployment = programmingPlan.departmentalStatus?.some(
                (_) =>
                  _.region === programmingPlanLocalStatus.region &&
                  _.department === programmingPlanLocalStatus.department &&
                  _.status === 'Validated'
              );

              const localPrescriptions =
                await localPrescriptionRepository.findMany({
                  programmingPlanIds: [programmingPlanId],
                  region: programmingPlanLocalStatus.region,
                  department: programmingPlanLocalStatus.department
                });

              const samplers = await userRepository.findMany({
                roles: ['Sampler'],
                region: programmingPlanLocalStatus.region,
                department: programmingPlanLocalStatus.department as Department,
                stages: stagesFromSubPlans(programmingPlan.subPlans),
                companySirets: localPrescriptions
                  .map((localPrescription) => localPrescription.companySiret)
                  .filter((_) => !isNil(_)),
                disabled: false
              });

              await notificationService.sendNotification(
                isRedeployment
                  ? { category: 'ProgrammingPlanModifiedAfterSubmission', link }
                  : { category: 'ProgrammingPlanValidated', link },
                samplers,
                isRedeployment
                  ? modifiedParams(programmingPlan.year, 'Departmental')
                  : {
                      object:
                        NotificationCategoryTitles.ProgrammingPlanValidated,
                      content: `
L’étape de la répartition de la programmation a été réalisée par votre coordinateur. La campagne est lancée !

Vous pouvez dorénavant consulter la programmation, vous concernant, dans l’onglet "Programmation" et saisir des prélèvements.`
                    },
                isRedeployment
                  ? {
                      message: modifiedMessage(
                        programmingPlan.year,
                        'Departmental'
                      )
                    }
                  : undefined
              );
            } else {
              if (
                ['SubmittedToRegion', 'Validated'].includes(
                  programmingPlanLocalStatus.status
                )
              ) {
                const regionalCoordinators = await userRepository.findMany({
                  roles: ['RegionalCoordinator'],
                  region: programmingPlanLocalStatus.region,
                  stages: stagesFromSubPlans(programmingPlan.subPlans),
                  disabled: false
                });

                if (programmingPlanLocalStatus.status === 'SubmittedToRegion') {
                  await programmingPlanRepository.updateNationalStatus(
                    programmingPlanId,
                    'SubmittedToRegion',
                    programmingPlan.distributionKind
                  );
                }

                await (programmingPlanLocalStatus.status === 'SubmittedToRegion'
                  ? notificationService.sendNotification(
                      {
                        category: 'ProgrammingPlanSubmittedToRegion',
                        link
                      },
                      regionalCoordinators,
                      submittedToRegionParams(programmingPlan.year),
                      {
                        message: submittedToRegionMessage(programmingPlan.year)
                      }
                    )
                  : notificationService.sendNotification(
                      {
                        category: 'ProgrammingPlanValidated',
                        link
                      },
                      regionalCoordinators,
                      {
                        object:
                          NotificationCategoryTitles.ProgrammingPlanValidated,
                        content: `
L’étape de programmation a été clôturée par la coordination nationale.  

En tant que coordinateur régional, vous pouvez dorénavant vous connecter à ${Brand} sur l’espace "programmation" afin d’attribuer le/les laboratoires responsables des analyses officielles en lien avec les matrices programmées pour la prochaine campagne du dispositif PSPC dans votre région.  

Une fois le/les laboratoires attribués, la campagne sera officiellement lancée et les inspecteurs/préleveurs de vos régions pourront initier leurs prélèvements.`
                      }
                    ));
              } else if (
                programmingPlanLocalStatus.status === 'SubmittedToDepartments'
              ) {
                await programmingPlanRepository.insertManyLocalStatus(
                  programmingPlanId,
                  Regions[
                    programmingPlanLocalStatus.region as Region
                  ].departments.map((department) => ({
                    region: programmingPlanLocalStatus.region as Region,
                    department,
                    status: 'SubmittedToDepartments' as const
                  }))
                );

                const departmentalCoordinators = await userRepository.findMany({
                  roles: ['DepartmentalCoordinator'],
                  region: programmingPlanLocalStatus.region,
                  stages: stagesFromSubPlans(programmingPlan.subPlans),
                  disabled: false
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanSubmittedToDepartments',
                    link
                  },
                  departmentalCoordinators,
                  submittedToDepartmentsParams(programmingPlan.year),
                  {
                    message: submittedToDepartmentsMessage(programmingPlan.year)
                  }
                );
              } else return { status: HttpStatus.BAD_REQUEST };
            }

            await programmingPlanRepository.updateLocalStatus(
              programmingPlanId,
              programmingPlanLocalStatus,
              programmingPlan.distributionKind
            );

            //TODO notif + test
            if (
              programmingPlanLocalStatus.department &&
              programmingPlanLocalStatus.status === 'Validated'
            ) {
              const updatedProgrammingPlan =
                await programmingPlanRepository.findUnique(programmingPlanId);

              if (updatedProgrammingPlan) {
                const allDepartmentsApproved = Regions[
                  programmingPlanLocalStatus.region as Region
                ].departments.every(
                  (department) =>
                    updatedProgrammingPlan.departmentalStatus?.find(
                      (_) =>
                        _.region === programmingPlanLocalStatus.region &&
                        _.department === department
                    )?.status === 'Validated'
                );

                if (allDepartmentsApproved) {
                  await programmingPlanRepository.updateLocalStatus(
                    programmingPlanId,
                    {
                      region: programmingPlanLocalStatus.region,
                      status: 'Validated'
                    },
                    programmingPlan.distributionKind
                  );
                }
              }
            }
          }
        )
      );

      const updatedProgrammingPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!updatedProgrammingPlan) {
        throw new Error('Programming plan not found after update');
      }
      return {
        status: HttpStatus.OK,
        response: maskHasPendingChangeForViewer(
          updatedProgrammingPlan,
          userRole,
          user
        )
      };
    }
  }
} as const satisfies ProtectedSubRouter;
