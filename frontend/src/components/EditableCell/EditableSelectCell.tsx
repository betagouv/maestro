import Select from '@codegouvfr/react-dsfr/Select';
import { InputHTMLAttributes, useState } from 'react';
import { AppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';

type EditableCellProps = Omit<
  InputHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  options: AppSelectOption[];
  initialValue: string;
  onChange: (value?: string) => void;
};

const EditableSelectCell = ({
  initialValue,
  onChange,
  options,
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
        <Select
          label={undefined}
          nativeSelectProps={{
            defaultValue: initialValue,
            autoFocus: true,
            onChange: (e) => setValue(e.target.value),
            onBlur: submitEdition,
          }}
        >
          {options.map((option) => (
            <option
              label={option.label}
              value={option.value}
              disabled={option.disabled}
              selected={option.selected}
              hidden={option.hidden}
              key={`option_${option.value}`}
            ></option>
          ))}
        </Select>
      ) : (
        <div className="editable-cell" onClick={() => setIsEditing(true)}>
          {options.find((o) => o.value === value)?.label ?? '-'}
        </div>
      )}
    </>
  );
};

export default EditableSelectCell;
