import Input from '@codegouvfr/react-dsfr/Input';
import { isNil } from 'lodash-es';
import { ReactNode, useState } from 'react';
import AppToast from '../_app/AppToast/AppToast';

interface EditableCellProps {
  initialValue: number;
  isEditable?: boolean;
  onChange: (value: number) => void;
  defaultContent: ReactNode;
  max?: number;
}

const EditableNumberCell = ({
  initialValue,
  isEditable,
  onChange,
  defaultContent,
  max
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isEditingError, setIsEditingError] = useState(false);

  const submitEdition = () => {
    if (value !== initialValue) {
      onChange(value);
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingError(false);
    const newValue = Number(e.target.value);

    if (!isNil(max) && newValue > max) {
      e.preventDefault();
      setIsEditingError(true);
      return;
    }

    if (!isNaN(newValue)) {
      setValue(newValue);
    }
  };

  return (
    <>
      <AppToast
        open={isEditingError}
        severity={'error'}
        description="Nombre maximum de prélèvement atteint"
        onClose={() => setIsEditingError(false)}
      />
      {isEditing ? (
        <Input
          label={undefined}
          nativeInputProps={{
            type: 'number',
            value,
            autoFocus: true,
            min: 0,
            onChange: handleChange,
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                submitEdition();
              }
            },
            onBlur: submitEdition
          }}
        />
      ) : (
        <>
          {isEditable ? (
            <div className="editable-cell" onClick={() => setIsEditing(true)}>
              {defaultContent}
            </div>
          ) : (
            defaultContent
          )}
        </>
      )}
    </>
  );
};

export default EditableNumberCell;
