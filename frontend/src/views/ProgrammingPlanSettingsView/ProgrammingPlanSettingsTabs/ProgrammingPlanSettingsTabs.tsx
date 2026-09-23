import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isEqual } from 'lodash-es';
import { planSaveConflicts } from 'maestro-shared/schema/ProgrammingPlan/completedSubPlanSettings';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import {
  emptyProgrammingPlanSettings,
  pickProgrammingPlanSettings,
  withSamplesBelowSubstanceKinds
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import {
  ProgrammingLevelSettingsForm,
  ProgrammingSubPlanLevelSettingsForm
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { assertUnreachable } from 'maestro-shared/utils/typescript';
import { checkSchema } from 'maestro-shared/utils/zod';
import {
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import type { z } from 'zod';
import { ProgrammingPlanGlobalSettings } from '../ProgrammingPlanGlobalSettings/ProgrammingPlanGlobalSettings';
import { ProgrammingPlanSamplerFormSettings } from '../ProgrammingPlanSamplerFormSettings/ProgrammingPlanSamplerFormSettings';
import { ProgrammingPlanSampleSettings } from '../ProgrammingPlanSampleSettings/ProgrammingPlanSampleSettings';
import { ProgrammingSubPlanActionBar } from '../ProgrammingSubPlanActionBar/ProgrammingSubPlanActionBar';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  subPlan: ProgrammingSubPlan | undefined;
};

const emptySettings: ProgrammingLevelSettingsForm = {
  ...emptyProgrammingPlanSettings(false),
  settingsCompleted: false,
  nationalCoordinators: null,
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
  keyof ProgrammingLevelSettingsForm,
  `${string}Managed` | 'settingsCompleted'
>;

const completionModal = createModal({
  id: 'programming-plan-settings-completion-modal',
  isOpenedByDefault: false
});

const tabIdBySettingsKey: Record<SettingsFieldKey, SettingsTabId> = {
  stages: 'global',
  substanceKinds: 'global',
  samples: 'samples',
  nationalCoordinators: 'global',
  fields: 'sampler-form'
};

const planSaveConflictMessage = ({
  reason,
  subPlanNumbers
}: ReturnType<typeof planSaveConflicts>[number]) =>
  reason === 'missing'
    ? `Ne peut pas être vide : les sous-plans terminés ${subPlanNumbers.join(', ')} l’utilisent.`
    : `Les échantillons des sous-plans terminés ${subPlanNumbers.join(', ')} ne correspondraient plus à leurs analytes.`;

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

  const { user, account } = useAuthentication();

  const readOnly =
    !user ||
    !account ||
    !canUpdateProgrammingPlanSettings(programmingPlan, user, account.roles);

  const settings: ProgrammingLevelSettingsForm | undefined = useMemo(
    () =>
      subPlan
        ? subPlanSettings && {
            ...subPlanSettings,
            nationalCoordinators: null
          }
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

  const [draft, setDraft] = useState<ProgrammingLevelSettingsForm>();

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const [selectedTabId, setSelectedTabId] = useState<SettingsTabId>('global');

  const formSchema = useMemo(
    () =>
      subPlan
        ? ProgrammingSubPlanLevelSettingsForm
        : checkSchema(ProgrammingLevelSettingsForm, (ctx) => {
            for (const conflict of planSaveConflicts(
              programmingPlan.subPlans,
              programmingPlan,
              ctx.value
            )) {
              ctx.issues.push({
                input: ctx.value,
                code: 'custom',
                message: planSaveConflictMessage(conflict),
                path: [conflict.settingKey]
              });
            }
          }),
    [subPlan, programmingPlan]
  );

  const [validation, setValidation] = useState<{
    settingsCompleted: boolean;
  }>();

  const form = useForm(formSchema, {
    ...(draft ?? emptySettings),
    settingsCompleted: validation?.settingsCompleted ?? true
  });

  const save = (
    draft: ProgrammingLevelSettingsForm,
    settingsCompleted: boolean
  ) => {
    if (subPlan) {
      return updateProgrammingSubPlanSettings({
        programmingPlanId,
        programmingSubPlanId: subPlan.id,
        ...pickProgrammingPlanSettings(draft),
        fields: draft.fields,
        settingsCompleted
      });
    } else {
      return updateProgrammingPlanSettings({
        programmingPlanId,
        ...pickProgrammingPlanSettings(draft),
        nationalCoordinators: draft.nationalCoordinators ?? [],
        settingsCompleted,
        fields: draft.fields.map(({ fieldId, required, optionIds }) => ({
          fieldId,
          required,
          optionIds
        }))
      });
    }
  };

  const complete = async (draft: ProgrammingLevelSettingsForm) => {
    try {
      await save(draft, true).unwrap();
      form.reset();
    } catch (_err) {
      /* empty */
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

  useEffect(() => {
    if (!validation || !draft) {
      return;
    }
    form.validate(async () => {
      if (!validation.settingsCompleted) {
        await save(draft, false);
      } else if (draft.settingsCompleted) {
        await complete(draft);
      } else {
        completionModal.open();
      }
    }, selectTabInError);
  }, [validation]);

  if (!draft) {
    return null;
  }

  const changeDraft = (draft: ProgrammingLevelSettingsForm) =>
    setDraft(
      withSamplesBelowSubstanceKinds(
        draft,
        subPlan ? programmingPlan : undefined
      )
    );

  const tabContent = (tabId: SettingsTabId): ReactNode => {
    switch (tabId) {
      case 'global':
        return (
          <ProgrammingPlanGlobalSettings
            settings={draft}
            planSettings={subPlan ? programmingPlan : undefined}
            inputForm={form}
            onChange={changeDraft}
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
        return (
          <ProgrammingPlanSampleSettings
            settings={draft}
            planSettings={subPlan ? programmingPlan : undefined}
            inputForm={form}
            onChange={changeDraft}
          />
        );
      case 'analyses':
        return null;
      default:
        assertUnreachable(tabId);
    }
  };

  return (
    <>
      <Tabs
        className={cx('fr-mt-3w')}
        tabs={settingsTabs.map(({ tabId, label }) => ({ tabId, label }))}
        selectedTabId={selectedTabId}
        onTabChange={(tabId) => setSelectedTabId(tabId as SettingsTabId)}
      >
        <div inert={readOnly}>{tabContent(selectedTabId)}</div>
      </Tabs>
      {!readOnly && (
        <>
          <ProgrammingSubPlanActionBar
            completed={draft.settingsCompleted}
            hasChanges={!isEqual(draft, settings)}
            saveCall={
              subPlan ? updateSubPlanSettingsCall : updatePlanSettingsCall
            }
            onReset={() => setDraft(settings)}
            onSaveDraft={() => setValidation({ settingsCompleted: false })}
            onComplete={() => setValidation({ settingsCompleted: true })}
          />
          <ConfirmationModal
            modal={completionModal}
            title="Terminer le paramétrage"
            confirmLabel="Terminer"
            onConfirm={() => complete(draft)}
            closeOnConfirm
          >
            Vous vous apprêtez à terminer le paramétrage{' '}
            {subPlan ? 'de ce sous-plan' : 'de ce plan'}. Il restera modifiable,
            mais ne pourra plus revenir à l’état de brouillon.
          </ConfirmationModal>
        </>
      )}
    </>
  );
};
