import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { StageLabels, StageList } from 'maestro-shared/referential/Stage';
import {
  ContextLabels,
  type ProgrammingPlanContext,
  ProgrammingPlanContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanEditionPhase } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanEditionPhase';
import type { ProgrammingPlanNationalCoordinator } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings.ts';
import type {
  ProgrammingLevelSettingsForm,
  ProgrammingPlanTechnicalInstruction
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import {
  SubstanceKind,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanDocuments } from '../ProgrammingPlanDocuments/ProgrammingPlanDocuments';
import { ProgrammingPlanMatrixSettings } from '../ProgrammingPlanMatrixSettings/ProgrammingPlanMatrixSettings';
import { ProgrammingPlanNationalCoordinators } from '../ProgrammingPlanNationalCoordinators/ProgrammingPlanNationalCoordinators';
import { ProgrammingPlanSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';
import './ProgrammingPlanGlobalSettings.scss';

type Props<
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
    technicalInstruction: ProgrammingPlanTechnicalInstruction | null;
    subPlanNumber: string | null;
  }
> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  editionPhase: ProgrammingPlanEditionPhase;
  technicalInstructionFile: File | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
  onTechnicalInstructionFileChange: (file: File | undefined) => void;
};

export const ProgrammingPlanGlobalSettings = <
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
    technicalInstruction: ProgrammingPlanTechnicalInstruction | null;
    subPlanNumber: string | null;
  }
>({
  settings,
  planSettings,
  editionPhase,
  technicalInstructionFile,
  inputForm,
  onChange,
  onTechnicalInstructionFileChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasAccountPermission } = useAuthentication();

  return (
    <div className={clsx('programming-plan-global-settings')}>
      {settings.subPlanNumber !== null && (
        <div className={clsx('border', cx('fr-p-2w'))}>
          <AppTextInput
            label="N° du sous-plan"
            required
            disabled={!hasAccountPermission('administrationMaestro')}
            value={settings.subPlanNumber}
            onChange={(event) =>
              onChange({ ...settings, subPlanNumber: event.target.value })
            }
            inputForm={inputForm}
            inputKey="subPlanNumber"
          />
        </div>
      )}
      {settings.nationalCoordinators !== null && (
        <div className={clsx('border', cx('fr-p-2w'))}>
          <ProgrammingPlanNationalCoordinators
            nationalCoordinators={settings.nationalCoordinators}
            inputForm={inputForm}
            onChange={(nationalCoordinators) =>
              onChange({ ...settings, nationalCoordinators })
            }
          />
        </div>
      )}
      <ProgrammingPlanSettingInheritance
        settingKey="stages"
        label="Stade(s) de prélèvement"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {(props) => (
          <AppMultiSelect
            inputForm={inputForm}
            inputKey={'stages'}
            items={StageList}
            values={settings.stages ?? []}
            onChange={(stages) => onChange({ ...settings, stages })}
            keysWithLabels={StageLabels}
            defaultLabel={'stade sélectionné'}
            {...props}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      <ProgrammingPlanSettingInheritance
        settingKey="substanceKinds"
        label="Analyte(s)"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {(props) => (
          <AppMultiSelect
            inputForm={inputForm}
            inputKey={'substanceKinds'}
            items={SubstanceKind.options}
            values={settings.substanceKinds ?? []}
            onChange={(substanceKinds) =>
              onChange({ ...settings, substanceKinds })
            }
            keysWithLabels={SubstanceKindLabels}
            defaultLabel={'analyte sélectionné'}
            {...props}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      <ProgrammingPlanSettingInheritance
        settingKey="context"
        label="Contexte"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {(props) => (
          <AppSelect
            value={settings.context ?? ''}
            options={selectOptionsFromList(ProgrammingPlanContextList, {
              labels: ContextLabels,
              withDefault: 'auto',
              defaultLabel: 'Choisir un contexte'
            })}
            onChange={(event) =>
              onChange({
                ...settings,
                context: (event.target.value ||
                  null) as ProgrammingPlanContext | null
              })
            }
            inputForm={inputForm}
            inputKey="context"
            {...props}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      <ProgrammingPlanSettingInheritance
        settingKey="matrices"
        label="Matrice(s)"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {(props) => (
          <ProgrammingPlanMatrixSettings
            matrices={settings.matrices}
            errorMessage={inputForm.message('matrices')}
            onChange={(matrices) => onChange({ ...settings, matrices })}
            {...props}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      <ProgrammingPlanSettingInheritance
        settingKey="programmingInstruction"
        label="Clé de répartition conseillée"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {({ disabled, label }) => (
          <AppTextAreaInput
            value={settings.programmingInstruction ?? ''}
            onChange={(event) =>
              onChange({
                ...settings,
                programmingInstruction: event.target.value || null
              })
            }
            inputForm={inputForm}
            inputKey="programmingInstruction"
            label={label}
            disabled={disabled}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      <ProgrammingPlanSettingInheritance
        settingKey="notes"
        label="Note additionnelle"
        settings={settings}
        planSettings={planSettings}
        editionPhase={editionPhase}
        onChange={onChange}
      >
        {({ disabled, label }) => (
          <AppTextAreaInput
            value={settings.notes ?? ''}
            onChange={(event) =>
              onChange({ ...settings, notes: event.target.value || null })
            }
            inputForm={inputForm}
            inputKey="notes"
            label={label}
            hintText="Cette note sera visible par tous les utilisateurs et utilisatrices de Maestro"
            disabled={disabled}
          />
        )}
      </ProgrammingPlanSettingInheritance>
      {!planSettings && (
        <ProgrammingPlanDocuments
          technicalInstruction={settings.technicalInstruction}
          technicalInstructionFile={technicalInstructionFile}
          inputForm={inputForm}
          onChange={(technicalInstruction) =>
            onChange({ ...settings, technicalInstruction })
          }
          onFileChange={onTechnicalInstructionFileChange}
        />
      )}
    </div>
  );
};
