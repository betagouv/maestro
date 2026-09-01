import ButtonGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { assert, type Equals } from 'tsafe';
import './ProgrammingSubPlanActionBar.scss';

type Props = {
  hasChanges: boolean;
  onReset: () => void;
  onSave: () => void;
};

export const ProgrammingSubPlanActionBar = ({
  hasChanges,
  onReset,
  onSave,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className="programming-sub-plan-action-bar">
      <div className={cx('fr-container', 'fr-pt-3w', 'fr-pb-1w')}>
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
            {
              children: 'Enregistrer en brouillon',
              priority: 'secondary',
              onClick: onSave
            },
            {
              children: 'Enregistrer et terminer',
              //FIXME DOMAIN gère la notion de Terminer
              onClick: onSave
            }
          ]}
        />
      </div>
    </div>
  );
};
