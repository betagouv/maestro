import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isEqual } from 'lodash-es';
import { canUpdateProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
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
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import './ProgrammingPlanSettingsTabs.scss';
import type { z } from 'zod';
import { ProgrammingPlanGlobalSettings } from '../ProgrammingPlanGlobalSettings/ProgrammingPlanGlobalSettings';
import { ProgrammingPlanSamplerFormSettings } from '../ProgrammingPlanSamplerFormSettings/ProgrammingPlanSamplerFormSettings';
import { ProgrammingSubPlanActionBar } from '../ProgrammingSubPlanActionBar/ProgrammingSubPlanActionBar';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  subPlan: ProgrammingSubPlan | undefined;
};

const emptySettings: ProgrammingLevelSettingsForm = {
  stages: null,
  stagesManaged: false,
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
  nationalCoordinators: 'global',
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

  const { user, userRole } = useAuthentication();

  const readOnly =
    !user ||
    !userRole ||
    !canUpdateProgrammingPlanSettings(programmingPlan, user, userRole);

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

  const form = useForm(ProgrammingLevelSettingsForm, {
    ...(draft ?? emptySettings),
    settingsCompleted: true
  });

  const save = (
    draft: ProgrammingLevelSettingsForm,
    settingsCompleted: boolean
  ) => {
    if (subPlan) {
      return updateProgrammingSubPlanSettings({
        programmingPlanId,
        programmingSubPlanId: subPlan.id,
        stages: draft.stages,
        stagesManaged: draft.stagesManaged,
        fields: draft.fields,
        settingsCompleted
      });
    } else {
      return updateProgrammingPlanSettings({
        programmingPlanId,
        stages: draft.stages,
        stagesManaged: draft.stagesManaged,
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

  if (!draft) {
    return null;
  }

  const complete = async () => {
    try {
      await save(draft, true).unwrap();
      form.reset();
    } catch (_err) {
      /* empty */
    }
  };

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
        <div inert={readOnly} className="programming-plan-settings-panel">
          {tabContent(selectedTabId)}
        </div>
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
            onSaveDraft={() => save(draft, false)}
            onComplete={() =>
              form.validate(
                async () =>
                  draft.settingsCompleted
                    ? await complete()
                    : completionModal.open(),
                selectTabInError
              )
            }
          />
          <ConfirmationModal
            modal={completionModal}
            title="Terminer le paramétrage"
            confirmLabel="Terminer"
            onConfirm={complete}
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
