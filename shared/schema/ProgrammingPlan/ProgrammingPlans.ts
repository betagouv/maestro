import { isNil } from "lodash-es";
import { z } from "zod";
import { LegalContext } from "../../referential/LegalContext";
import { checkSchema } from "../../utils/zod";
import { ProgrammingPlanContext } from "./Context";
import { DistributionKind } from "./DistributionKind";
import { ProgrammingPlanDomainId } from "./ProgrammingPlanDomain";
import {
  ProgrammingPlanDepartmentalStatus,
  ProgrammingPlanNationalStatus,
  ProgrammingPlanRegionalStatus,
} from "./ProgrammingPlanLocalStatus";
import { ProgrammingPlanNationalCoordinator } from "./ProgrammingPlanNationalCoordinator";
import { ProgrammingPlanSettings } from "./ProgrammingPlanSettings";
import {
  isProgrammingSubPlanDeletable,
  ProgrammingSubPlan,
} from "./ProgrammingSubPlan";

export const ProgrammingPlanBase = z.object({
  id: z.guid(),
  domainId: ProgrammingPlanDomainId,
  title: z.string().min(1, "Veuillez renseigner le titre."),
  subPlans: z.array(ProgrammingSubPlan),
  contexts: z
    .array(ProgrammingPlanContext)
    .min(1, "Veuillez renseigner au moins un contexte."),
  legalContexts: z
    .array(LegalContext)
    .min(1, "Veuillez renseigner au moins un cadre juridique."),
  samplesOutsidePlanAllowed: z.boolean(),
  distributionKind: DistributionKind,
  nationalCoordinators: z.array(ProgrammingPlanNationalCoordinator),
  ...ProgrammingPlanSettings.shape,
  settingsCompleted: z.boolean(),
  createdAt: z.coerce.date(),
  createdBy: z.guid(),
  year: z.number(),
  nationalStatus: ProgrammingPlanNationalStatus,
  regionalStatus: z.array(ProgrammingPlanRegionalStatus),
  departmentalStatus: z.array(ProgrammingPlanDepartmentalStatus),
  closedAt: z.coerce.date().nullish(),
  closedBy: z.guid().nullish(),
  launchedAt: z.coerce.date().nullish(),
  launchedBy: z.guid().nullish(),
});

export const ProgrammingPlanChecked = checkSchema(
  ProgrammingPlanBase,
  (ctx) => {
    if (ctx.value.launchedAt && !ctx.value.launchedBy) {
      ctx.issues.push({
        input: ctx.value,
        code: "custom",
        message: "Veuillez renseigner launchedBy si launchedAt est renseigné",
        path: ["launchedBy"],
      });
    }
    if (ctx.value.closedAt && !ctx.value.closedBy) {
      ctx.issues.push({
        input: ctx.value,
        code: "custom",
        message: "Veuillez renseigner closedBy si closedAt est renseigné",
        path: ["closedBy"],
      });
    }
    if (
      ctx.value.closedAt &&
      ctx.value.regionalStatus.some((status) => status.status !== "Closed")
    ) {
      ctx.issues.push({
        input: ctx.value,
        code: "custom",
        message: 'Status régional doit être "Closed" si closedAt est renseigné',
        path: ["regionalStatus"],
      });
    }
  },
);

export type ProgrammingPlanChecked = z.infer<typeof ProgrammingPlanChecked>;

export const isClosed = (plan: ProgrammingPlanChecked): boolean => {
  return !isNil(plan.closedAt);
};

type DeletableProgrammingPlan = Pick<
  ProgrammingPlanChecked,
  "settingsCompleted"
> & {
  subPlans: Pick<ProgrammingSubPlan, "settingsCompleted">[];
};

export const isProgrammingPlanDeletable = (
  plan: DeletableProgrammingPlan,
): boolean =>
  !plan.settingsCompleted && plan.subPlans.every(isProgrammingSubPlanDeletable);

export const isProgrammingPlanDomainDeletable = (
  plans: DeletableProgrammingPlan[],
): boolean => plans.every(isProgrammingPlanDeletable);

export const hasNewerLaunchedCampaign = (
  plan: Pick<ProgrammingPlanChecked, "domainId" | "title" | "year">,
  plans: Pick<
    ProgrammingPlanChecked,
    "domainId" | "title" | "year" | "launchedAt"
  >[],
  domainLabelById: Map<string, string>,
): boolean =>
  plans.some(
    (other) =>
      other.title === plan.title &&
      domainLabelById.get(other.domainId) ===
        domainLabelById.get(plan.domainId) &&
      other.year > plan.year &&
      !isNil(other.launchedAt),
  );

export const ProgrammingPlanSort = (
  a: ProgrammingPlanChecked,
  b: ProgrammingPlanChecked,
) => b.year - a.year || a.title.localeCompare(b.title);
