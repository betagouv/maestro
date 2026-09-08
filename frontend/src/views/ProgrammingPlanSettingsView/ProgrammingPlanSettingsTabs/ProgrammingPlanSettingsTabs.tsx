import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isEqual } from 'lodash-es';
import { ProgrammingSubPlanSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import {
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import type { z } from 'zod';
import { ProgrammingPlanGlobalSettings } from '../ProgrammingPlanGlobalSettings/ProgrammingPlanGlobalSettings';
import { ProgrammingPlanSamplerFormSettings } from '../ProgrammingPlanSamplerFormSettings/ProgrammingPlanSamplerFormSettings';
import { ProgrammingSubPlanActionBar } from '../ProgrammingSubPlanActionBar/ProgrammingSubPlanActionBar';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  subPlan: ProgrammingSubPlan | undefined;
};

const emptySettings: ProgrammingSubPlanSettingsForm = {
  stages: null,
  stagesManaged: false,
  settingsCompleted: false,
  fields: []
};

const settingsTabs = [
  { tabId: 'global', label: 'Paramétrage global' },
  { tabId: 'sampler-form', label: 'Formulaire préleveur' },
  { tabId: 'samples', label: 'Échantillons' },
  { tabId: 'analyses', label: 'Analyses' }
] as const satisfies { tabId: string; label: string }[];

type SettingsTabId = (typeof settingsTabs)[number]['tabId'];

type SettingsFieldKey = Exclude<
  keyof ProgrammingSubPlanSettingsForm,
  `${string}Managed` | 'settingsCompleted'
>;

const tabIdBySettingsKey: Record<SettingsFieldKey, SettingsTabId> = {
  stages: 'global',
  fields: 'sampler-form'
};

export const ProgrammingPlanSettingsTabs = ({
  programmingPlan,
  subPlan,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const programmingPlanId = programmingPlan.id;

  const { data: planSettings } = apiClient.useFindProgrammingPlanSettingsQuery(
    { programmingPlanId },
    { skip: !!subPlan }
  );
  const { data: subPlanSettings } =
    apiClient.useFindProgrammingSubPlanSettingsQuery(
      {
        programmingPlanId,
        programmingSubPlanId: subPlan?.id as ProgrammingSubPlanId
      },
      { skip: !subPlan }
    );

  const [updateProgrammingPlanSettings, updatePlanSettingsCall] =
    apiClient.useUpdateProgrammingPlanSettingsMutation();
  const [updateProgrammingSubPlanSettings, updateSubPlanSettingsCall] =
    apiClient.useUpdateProgrammingSubPlanSettingsMutation();

  const settings: ProgrammingSubPlanSettingsForm | undefined = useMemo(
    () =>
      subPlan
        ? subPlanSettings
        : planSettings && {
            ...planSettings,
            fields: planSettings.fields.map((field) => ({
              ...field,
              inheritance: 'Own' as const,
              managedAtPlanLevel: false
            }))
          },
    [subPlan, subPlanSettings, planSettings]
  );

  const [draft, setDraft] = useState<ProgrammingSubPlanSettingsForm>();

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const [selectedTabId, setSelectedTabId] = useState<SettingsTabId>('global');

  const form = useForm(ProgrammingSubPlanSettingsForm, {
    ...(draft ?? emptySettings),
    settingsCompleted: true
  });

  const save = (
    draft: ProgrammingSubPlanSettingsForm,
    settingsCompleted: boolean
  ) => {
    if (subPlan) {
      updateProgrammingSubPlanSettings({
        programmingPlanId,
        programmingSubPlanId: subPlan.id,
        ...draft,
        settingsCompleted
      });
    } else {
      updateProgrammingPlanSettings({
        programmingPlanId,
        ...draft,
        settingsCompleted,
        fields: draft.fields.map(({ fieldId, required, optionIds }) => ({
          fieldId,
          required,
          optionIds
        }))
      });
    }
  };

  if (!draft) {
    return null;
  }

  const tabContent = (tabId: SettingsTabId): ReactNode => {
    switch (tabId) {
      case 'global':
        return (
          <ProgrammingPlanGlobalSettings
            settings={draft}
            planSettings={subPlan ? programmingPlan : undefined}
            inputForm={form}
            onChange={setDraft}
          />
        );
      case 'sampler-form':
        return (
          <ProgrammingPlanSamplerFormSettings
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
          />
        );
      case 'samples':
      case 'analyses':
        return null;
      default:
        assertUnreachable(tabId);
    }
  };

  const selectTabInError = ({ issues }: z.ZodError) => {
    const tabIdsInError = Object.entries(tabIdBySettingsKey)
      .filter(([settingsKey]) =>
        issues.some(({ path }) => path[0] === settingsKey)
      )
      .map(([, tabId]) => tabId);

    setSelectedTabId(
      settingsTabs.find(({ tabId }) => tabIdsInError.includes(tabId))?.tabId ??
        selectedTabId
    );
  };

  return (
    <>
      <Tabs
        className={cx('fr-mt-3w')}
        tabs={settingsTabs.map(({ tabId, label }) => ({ tabId, label }))}
        selectedTabId={selectedTabId}
        onTabChange={(tabId) => setSelectedTabId(tabId as SettingsTabId)}
      >
        {tabContent(selectedTabId)}
      </Tabs>
      <ProgrammingSubPlanActionBar
        completed={draft.settingsCompleted}
        hasChanges={!isEqual(draft, settings)}
        saveCall={subPlan ? updateSubPlanSettingsCall : updatePlanSettingsCall}
        onReset={() => setDraft(settings)}
        onSaveDraft={() => save(draft, false)}
        onComplete={() =>
          form.validate(async () => save(draft, true), selectTabInError)
        }
      />
    </>
  );
};
