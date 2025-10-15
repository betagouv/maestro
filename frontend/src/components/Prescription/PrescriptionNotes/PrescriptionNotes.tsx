import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useState } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  programmingPlan: ProgrammingPlan;
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

  return (
    <>
      {hasUserPrescriptionPermission(programmingPlan)?.update ? (
        <div className="d-flex-align-center">
          <Input
            label="Note"
            textArea
            nativeTextAreaProps={{
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              placeholder: 'Ajouter une note',
              rows: 1
            }}
            style={{
              width: '100%'
            }}
          />
          {onSubmitNotes && (
            <Button
              title="Ajouter"
              iconId="fr-icon-save-fill"
              onClick={() => onSubmitNotes(notes)}
              priority="secondary"
              className={cx('fr-ml-1w', 'fr-mt-1w')}
            />
          )}
        </div>
      ) : (
        <>{value}</>
      )}
    </>
  );
};

export default PrescriptionNotes;
