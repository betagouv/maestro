import { groupBy, isEqual, pick } from 'lodash-es';
import {
  type SubstanceKind,
  SubstanceKindLabels
} from '../Substance/SubstanceKind';
import type { ProgrammingPlanSampleSetting } from './ProgrammingPlanSampleSetting';
import {
  isMissingSetting,
  managedKey,
  ProgrammingPlanSettingKey,
  type ProgrammingPlanSettings
} from './ProgrammingPlanSettings';

type Issue = { path: (string | number)[]; message: string };

export const samplesCoverageIssues = (
  samples: ProgrammingPlanSampleSetting[],
  substanceKinds: SubstanceKind[]
): Issue[] => {
  const issues: Issue[] = [];

  samples.forEach((sample, index) => {
    const path = ['samples', index, 'substanceKinds'];
    const outsideSubstanceKind = sample.substanceKinds.find(
      (substanceKind) => !substanceKinds.includes(substanceKind)
    );
    if (sample.substanceKinds.length === 0) {
      issues.push({
        path,
        message: `Veuillez choisir au moins un analyte pour l’échantillon ${index + 1}.`
      });
    } else if (outsideSubstanceKind) {
      issues.push({
        path,
        message: `L’analyte « ${SubstanceKindLabels[outsideSubstanceKind]} » de l’échantillon ${index + 1} ne fait pas partie des analytes.`
      });
    }
  });

  for (const substanceKind of substanceKinds) {
    const label = SubstanceKindLabels[substanceKind];
    const sampleCount = samples.filter((sample) =>
      sample.substanceKinds.includes(substanceKind)
    ).length;
    if (sampleCount === 0) {
      issues.push({
        path: ['samples'],
        message: `L’analyte « ${label} » n’est affecté à aucun échantillon.`
      });
    } else if (sampleCount > 1) {
      issues.push({
        path: ['samples'],
        message: `L’analyte « ${label} » est affecté à plusieurs échantillons.`
      });
    }
  }

  return issues;
};

export const effectiveSubPlanSettings = (
  subPlanSettings: ProgrammingPlanSettings,
  planSettings: ProgrammingPlanSettings
): ProgrammingPlanSettings => ({
  ...subPlanSettings,
  ...pick(
    planSettings,
    ProgrammingPlanSettingKey.options.filter(
      (settingKey) => !subPlanSettings[managedKey(settingKey)]
    )
  )
});

export const subPlanSettingsAfterPlanSave = (
  subPlanSettings: ProgrammingPlanSettings,
  storedPlanSettings: ProgrammingPlanSettings,
  nextPlanSettings: ProgrammingPlanSettings
): ProgrammingPlanSettings => {
  const settings = { ...subPlanSettings };

  for (const settingKey of ProgrammingPlanSettingKey.options) {
    const managed = managedKey(settingKey);
    const planTakesOver =
      nextPlanSettings[managed] && !storedPlanSettings[managed];
    const planReleases =
      !nextPlanSettings[managed] && storedPlanSettings[managed];
    const keepsOwnSamples =
      settingKey === 'samples' && settings.substanceKindsManaged;

    if (planTakesOver && !keepsOwnSamples) {
      settings[managed] = false;
    }
    if (planReleases && !settings[managed]) {
      Object.assign(settings, pick(nextPlanSettings, settingKey));
      settings[managed] = true;
    }
  }

  return settings;
};

type CompletedSubPlanSettingIssue = {
  settingKey: ProgrammingPlanSettingKey;
  reason: 'missing' | 'incoherent';
};

export const completedSubPlanSettingIssues = (
  settings: ProgrammingPlanSettings
): CompletedSubPlanSettingIssue[] => {
  const issues: CompletedSubPlanSettingIssue[] = [];

  for (const settingKey of ProgrammingPlanSettingKey.options) {
    if (isMissingSetting(settings[settingKey])) {
      issues.push({ settingKey, reason: 'missing' });
    }
  }

  const { samples, substanceKinds, samplesManaged } = settings;
  if (
    samples &&
    substanceKinds &&
    samplesCoverageIssues(samples, substanceKinds).length > 0
  ) {
    issues.push({
      settingKey: samplesManaged ? 'substanceKinds' : 'samples',
      reason: 'incoherent'
    });
  }

  return issues;
};

type SubPlan = ProgrammingPlanSettings & {
  subPlanNumber: string;
  settingsCompleted: boolean;
};

const issuesCreatedByPlanSave = (
  subPlan: SubPlan,
  storedPlanSettings: ProgrammingPlanSettings,
  nextPlanSettings: ProgrammingPlanSettings
): CompletedSubPlanSettingIssue[] => {
  const issuesBefore = completedSubPlanSettingIssues(
    effectiveSubPlanSettings(subPlan, storedPlanSettings)
  );
  const issuesAfter = completedSubPlanSettingIssues(
    effectiveSubPlanSettings(
      subPlanSettingsAfterPlanSave(
        subPlan,
        storedPlanSettings,
        nextPlanSettings
      ),
      nextPlanSettings
    )
  );
  return issuesAfter.filter(
    (issue) => !issuesBefore.some((before) => isEqual(before, issue))
  );
};

export const planSaveConflicts = (
  subPlans: SubPlan[],
  storedPlanSettings: ProgrammingPlanSettings,
  nextPlanSettings: ProgrammingPlanSettings
): (CompletedSubPlanSettingIssue & { subPlanNumbers: string[] })[] => {
  const conflicts = subPlans
    .filter(({ settingsCompleted }) => settingsCompleted)
    .flatMap((subPlan) =>
      issuesCreatedByPlanSave(
        subPlan,
        storedPlanSettings,
        nextPlanSettings
      ).map((issue) => ({ ...issue, subPlanNumber: subPlan.subPlanNumber }))
    );

  return Object.values(
    groupBy(conflicts, ({ settingKey, reason }) => `${settingKey}-${reason}`)
  ).map((sameConflicts) => ({
    settingKey: sameConflicts[0].settingKey,
    reason: sameConflicts[0].reason,
    subPlanNumbers: sameConflicts.map(({ subPlanNumber }) => subPlanNumber)
  }));
};
