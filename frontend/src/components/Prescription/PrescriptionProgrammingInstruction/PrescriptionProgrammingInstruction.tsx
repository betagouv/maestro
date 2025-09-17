import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
  value: string;
  onSubmitInstruction: (instruction: string) => Promise<void>;
}

const PrescriptionProgrammingInstruction = ({
  programmingPlan,
  value,
  onSubmitInstruction
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();
  const [instruction, setInstruction] = useState(value);

  return (
    <>
      {hasUserPrescriptionPermission(programmingPlan)?.update ? (
        <div className="d-flex-align-center">
          <Input
            label="Consignes de répartition"
            hintText="Complément d’information, répartition, etc."
            textArea
            nativeTextAreaProps={{
              value: instruction,
              onChange: (e) => setInstruction(e.target.value),
              rows: 1
            }}
            style={{
              width: '100%'
            }}
          />
          <Button
            title="Enregistrer"
            iconId="fr-icon-save-line"
            onClick={() => onSubmitInstruction(instruction)}
            priority="secondary"
            className={cx('fr-ml-1w', 'fr-mt-4w')}
          />
        </div>
      ) : (
        <>{value}</>
      )}
    </>
  );
};

export default PrescriptionProgrammingInstruction;
