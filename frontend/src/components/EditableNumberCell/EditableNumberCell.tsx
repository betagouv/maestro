import Input from '@codegouvfr/react-dsfr/Input';
import { useState } from 'react';

interface EditableCellProps {
  initialValue: number;
  onChange: (value: number) => void;
}

const EditableNumberCell = ({ initialValue, onChange }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  return (
    <>
      {isEditing ? (
        <Input
          label={undefined}
          nativeInputProps={{
            type: 'number',
            value,
            autoFocus: true,
            min: 0,
            onChange: (e) => setValue(Number(e.target.value)),
            onBlur: () => {
              onChange(value);
              setIsEditing(false);
            },
          }}
        />
      ) : (
        <div className="pointer" onDoubleClick={() => setIsEditing(true)}>
          {value}
        </div>
      )}
    </>
  );
};

export default EditableNumberCell;
