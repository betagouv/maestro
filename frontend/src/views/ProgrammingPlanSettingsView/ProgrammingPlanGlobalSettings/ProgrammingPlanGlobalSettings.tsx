import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { StageLabels, StageList } from 'maestro-shared/referential/Stage';
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
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanDocuments } from '../ProgrammingPlanDocuments/ProgrammingPlanDocuments';
import { ProgrammingPlanNationalCoordinators } from '../ProgrammingPlanNationalCoordinators/ProgrammingPlanNationalCoordinators';
import { ProgrammingPlanSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';
import './ProgrammingPlanGlobalSettings.scss';

type Props<
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
    technicalInstruction: ProgrammingPlanTechnicalInstruction | null;
  }
> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  technicalInstructionFile: File | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
  onTechnicalInstructionFileChange: (file: File | undefined) => void;
};

export const ProgrammingPlanGlobalSettings = <
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
    technicalInstruction: ProgrammingPlanTechnicalInstruction | null;
  }
>({
  settings,
  planSettings,
  technicalInstructionFile,
  inputForm,
  onChange,
  onTechnicalInstructionFileChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={clsx('programming-plan-global-settings')}>
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
