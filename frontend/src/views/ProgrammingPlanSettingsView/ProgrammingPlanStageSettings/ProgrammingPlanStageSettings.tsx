import { createModal } from '@codegouvfr/react-dsfr/Modal';
import {
  type Stage,
  StageLabels,
  StageList,
  SubPlanStages,
  type SubStage,
  SubStageLabels,
  subStagesOf
} from 'maestro-shared/referential/Stage';
import type { ReactNode } from 'react';
import { AppHierarchicalSelection } from 'src/components/_app/AppHierarchicalSelection/AppHierarchicalSelection';
import type { Hierarchy } from 'src/components/_app/AppHierarchicalSelection/hierarchicalSelection';
import { assert, type Equals } from 'tsafe';

const stageSelectionModal = createModal({
  id: 'programming-sub-plan-stage-selection-modal',
  isOpenedByDefault: false
});

const stageHierarchy: Hierarchy<Stage, SubStage> = {
  parents: StageList,
  childrenOf: subStagesOf,
  parentLabel: (stage) => StageLabels[stage],
  childLabel: (subStage) => SubStageLabels[subStage]
};

type Props = {
  stages: SubPlanStages | null;
  label: ReactNode;
  required: boolean;
  disabled: boolean;
  errorMessage: string | undefined;
  onChange: (stages: SubPlanStages | null) => void;
};

export const ProgrammingPlanStageSettings = ({
  stages,
  label,
  required,
  disabled,
  errorMessage,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <AppHierarchicalSelection
      modal={stageSelectionModal}
      label={label}
      required={required}
      disabled={disabled}
      errorMessage={errorMessage}
      texts={{
        add: 'Ajouter stade(s) de prélèvement',
        edit: 'Modifier les stades de prélèvement',
        modalTitle: 'Stades de prélèvement',
        search: 'Rechercher un stade',
        allChildren: 'Tout le stade'
      }}
      hierarchy={stageHierarchy}
      selection={(stages ?? []).map(({ stage, subStages }) => ({
        parent: stage,
        children: subStages
      }))}
      onChange={(selection) =>
        onChange(
          selection.length === 0
            ? null
            : SubPlanStages.parse(
                selection.map(({ parent, children }) => ({
                  stage: parent,
                  subStages: children
                }))
              )
        )
      }
    />
  );
};
