import Input from '@codegouvfr/react-dsfr/Input';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAutoSave } from 'src/hooks/useAutoSave';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  value: string;
  onSubmitNotes?: (notes: string) => Promise<void>;
}

const PrescriptionNotes = ({
  programmingPlan,
  value,
  onSubmitNotes
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();
  const [notes, setNotes] = useState(value);

  const { triggerSave } = useAutoSave({
    onSave: (value) => onSubmitNotes?.(value),
    delay: 500
  });

  const handleInputChange = (newValue: string) => {
    setNotes(newValue);
    triggerSave(newValue);
  };

  return (
    <>
      {hasUserPrescriptionPermission(programmingPlan)?.update ? (
        <Input
          label="Note"
          textArea
          nativeTextAreaProps={{
            value: notes,
            onChange: (e) => handleInputChange(e.target.value),
            placeholder: 'Ajouter une note',
            rows: 1
          }}
          style={{
            width: '100%'
          }}
        />
      ) : (
        <>{value}</>
      )}
    </>
  );
};

export default PrescriptionNotes;
