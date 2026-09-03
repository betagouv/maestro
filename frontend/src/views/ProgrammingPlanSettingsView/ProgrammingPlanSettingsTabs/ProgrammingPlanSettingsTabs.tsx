import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isEqual } from 'lodash-es';
import type { ProgrammingSubPlanSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanGlobalSettings } from '../ProgrammingPlanGlobalSettings/ProgrammingPlanGlobalSettings';
import { ProgrammingPlanSamplerFormSettings } from '../ProgrammingPlanSamplerFormSettings/ProgrammingPlanSamplerFormSettings';
import { ProgrammingSubPlanActionBar } from '../ProgrammingSubPlanActionBar/ProgrammingSubPlanActionBar';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
  subPlan: ProgrammingSubPlan | undefined;
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

  const [updateProgrammingPlanSettings] =
    apiClient.useUpdateProgrammingPlanSettingsMutation();
  const [updateProgrammingSubPlanSettings] =
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

  const save = (draft: ProgrammingSubPlanSettingsForm) => {
    if (subPlan) {
      updateProgrammingSubPlanSettings({
        programmingPlanId,
        programmingSubPlanId: subPlan.id,
        ...draft
      });
    } else {
      updateProgrammingPlanSettings({
        programmingPlanId,
        ...draft,
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

  return (
    <>
      <Tabs
        className={cx('fr-mt-3w')}
        tabs={[
          {
            label: 'Paramétrage global',
            content: (
              <ProgrammingPlanGlobalSettings
                settings={draft}
                planSettings={subPlan ? programmingPlan : undefined}
                onChange={setDraft}
              />
            )
          },
          {
            label: 'Formulaire préleveur',
            content: (
              <ProgrammingPlanSamplerFormSettings
                fields={draft.fields}
                onChange={(fields) => setDraft({ ...draft, fields })}
              />
            )
          },
          { label: 'Échantillons', content: <></> },
          { label: 'Analyses', content: <></> }
        ]}
      />
      <ProgrammingSubPlanActionBar
        hasChanges={!isEqual(draft, settings)}
        onReset={() => setDraft(settings)}
        onSave={() => save(draft)}
      />
    </>
  );
};
