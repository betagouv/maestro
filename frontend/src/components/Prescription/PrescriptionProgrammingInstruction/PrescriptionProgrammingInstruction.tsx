import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { isNil } from 'lodash-es';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  value?: string | null;
  onSubmitInstruction?: (instruction: string) => Promise<void>;
}

const PrescriptionProgrammingInstruction = ({
  programmingPlan,
  value,
  onSubmitInstruction
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();
  const [instruction, setInstruction] = useState(value || '');

  const isDisabled = useMemo(
    () =>
      !hasUserPrescriptionPermission(programmingPlan)?.update ||
      !onSubmitInstruction,
    [programmingPlan, onSubmitInstruction, hasUserPrescriptionPermission]
  );

  return (
    <>
      {isDisabled ? (
        <div className={cx('fr-text--regular')}>
          {!isNil(instruction) && instruction.trim() !== '' && (
            <>
              <span className={cx('fr-icon-chat-quote-line', 'fr-pr-2w')} />
              {instruction}
            </>
          )}
        </div>
      ) : (
        <div className="d-flex-align-center">
          <Input
            label="Consignes de répartition"
            textArea
            nativeTextAreaProps={{
              value: instruction,
              onChange: (e) => setInstruction(e.target.value),
              rows: 1,
              placeholder: 'Ajouter des consignes...'
            }}
            style={{
              width: '100%'
            }}
          />
          <Button
            title="Enregistrer"
            iconId="fr-icon-save-line"
            onClick={() => onSubmitInstruction?.(instruction)}
            priority="secondary"
            className={cx('fr-ml-1w', 'fr-mt-1w')}
          />
        </div>
      )}
    </>
  );
};

export default PrescriptionProgrammingInstruction;
