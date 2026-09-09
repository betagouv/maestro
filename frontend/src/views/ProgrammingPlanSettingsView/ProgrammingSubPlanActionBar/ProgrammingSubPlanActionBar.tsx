import ButtonGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import { assert, type Equals } from 'tsafe';
import './ProgrammingSubPlanActionBar.scss';

type Props = {
  completed: boolean;
  hasChanges: boolean;
  saveCall: { isError: boolean; error?: unknown };
  onReset: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
};

export const ProgrammingSubPlanActionBar = ({
  completed,
  hasChanges,
  saveCall,
  onReset,
  onSaveDraft,
  onComplete,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className="programming-sub-plan-action-bar">
      <div className={cx('fr-container', 'fr-py-3w')}>
        <AppServiceErrorAlert call={saveCall} />
        <ButtonGroup
          alignment="right"
          inlineLayoutWhen="always"
          buttons={[
            {
              children: 'Réinitialiser les modifications',
              priority: 'tertiary no outline',
              iconId: 'fr-icon-arrow-go-back-fill',
              disabled: !hasChanges,
              onClick: onReset
            },
            ...(completed
              ? []
              : [
                  {
                    children: 'Enregistrer en brouillon',
                    priority: 'secondary' as const,
                    onClick: onSaveDraft
                  }
                ]),
            {
              children: completed ? 'Enregistrer' : 'Enregistrer et terminer',
              onClick: onComplete
            }
          ]}
        />
      </div>
    </div>
  );
};
