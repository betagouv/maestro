import Input from '@codegouvfr/react-dsfr/Input';
import { ReactNode, useState } from 'react';

interface EditableCellProps {
  initialValue: number;
  isEditable?: boolean;
  onChange: (value: number) => void;
  defaultContent: ReactNode;
}

const EditableNumberCell = ({
  initialValue,
  isEditable,
  onChange,
  defaultContent
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const submitEdition = () => {
    if (value !== initialValue) {
      onChange(value);
    }
    setIsEditing(false);
  };

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
