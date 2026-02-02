import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { isNil } from 'lodash-es';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo, useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAutoSave } from 'src/hooks/useAutoSave';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
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

  const { triggerSave } = useAutoSave({
    onSave: (value) => onSubmitInstruction?.(value),
    delay: 500
  });

  const isDisabled = useMemo(
    () =>
      !hasUserPrescriptionPermission(programmingPlan)?.update ||
      !onSubmitInstruction,
    [programmingPlan, onSubmitInstruction, hasUserPrescriptionPermission]
  );

  const handleInputChange = (newValue: string) => {
    setInstruction(newValue);
    triggerSave(newValue);
  };

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
        <Input
          label="Consignes de répartition"
          textArea
          nativeTextAreaProps={{
            value: instruction,
            onChange: (e) => handleInputChange(e.target.value),
            rows: 2,
            placeholder: 'Ajouter des consignes...'
          }}
          style={{
            width: '100%'
          }}
        />
      )}
    </>
  );
};

export default PrescriptionProgrammingInstruction;
