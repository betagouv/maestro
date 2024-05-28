import clsx from 'clsx';
import {
  createRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';
import './searchableSelect.css';

type SearchableSelectHint = string | Object | any[];

type SearchableSelectMessageType = 'error' | 'valid';

interface SearchableSelectOptions {
  disabled?: boolean;
  hidden?: boolean;
  label: string;
  value: string;
}

interface SearchableSelectProps {
  className?: string;
  disabled?: boolean;
  filter?: (...args: any[]) => any;
  hint?: SearchableSelectHint;
  id?: string;
  label?: string;
  message?: string;
  messageType?: SearchableSelectMessageType;
  name?: string;
  onBlur?: (...args: any[]) => any;
  onChange?: (...args: any[]) => any;
  onFocus?: (...args: any[]) => any;
  onKeyDown?: (...args: any[]) => any;
  onTextChange?: (...args: any[]) => any;
  options: SearchableSelectOptions[];
  placeholder?: string;
  required?: boolean;
  selected?: string;
}

interface AppSearchableSelectProps<T extends ZodRawShape>
  extends SearchableSelectProps {
  inputForm: ReturnType<typeof useForm>;
  inputKey: keyof T;
  inputPathFromKey?: (string | number)[];
  whenValid?: string;
}

function AppSearchableSelect<T extends ZodRawShape>({
  options,
  onChange,
  inputForm,
  inputKey,
  inputPathFromKey,
  whenValid,
  ...remainingProps
}: AppSearchableSelectProps<T>) {
  const optionsRef = useRef<MutableRefObject<HTMLDivElement>[]>([]);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [arrowSelected, setArrowSelected] = useState<number | null>(null);
  const [internalLabel, setInternalLabel] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  if (options.length !== optionsRef.current.length) {
    optionsRef.current = Array(options.length)
      .fill(undefined)
      .map((option, i) => optionsRef.current[i] || createRef());
  }

  // useEffect(() => {
  //   if (selected) {
  //     const selectedOption = options.find(
  //       (option) => option.value === selected
  //     );
  //     setInternalLabel(selectedOption ? selectedOption.label : '');
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [options]);

  useEffect(() => {
    if (optionsContainerRef.current !== null) {
      if (arrowSelected) {
        optionsContainerRef.current.scrollTop = Math.max(
          0,
          optionsRef.current[arrowSelected].current.offsetTop - 20
        );
      } else {
        optionsContainerRef.current.scrollTop = 0;
      }
    }
  }, [arrowSelected]);

  const filteredOptions = options;
  //   .filter((option, index, arr) =>
  //   filter?.(internalLabel, option, index, arr)
  // );

  const onTextInternalChange = (value: string) => {
    // onTextChange?.(value);
    setInternalLabel(value);
  };

  const onInternalChange = (newValue: string, newLabel: string) => {
    onTextInternalChange(newLabel);
    onChange?.(newValue);
  };

  const onInternalFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onInternalChange('', '');
    setShowOptions(true);
    setArrowSelected(null);
    // onFocus?.(e);
  };

  const onInternalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // if (filteredOptions.length === 1) {
    //   onInternalChange(filteredOptions[0].value, filteredOptions[0].label);
    // } else {
    const foundValue = options.find((option) => option.label === internalLabel);
    if (!foundValue) {
      onTextInternalChange('');
    }
    // }
    setShowOptions(false);
    // onBlur?.(e);
  };

  // const onInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   // onKeyDown?.(e);
  //   switch (e.key) {
  //     case 'ArrowDown':
  //       e.preventDefault();
  //       setShowOptions(true);
  //       if (arrowSelected === null) {
  //         setArrowSelected(0);
  //       } else if (
  //         arrowSelected <
  //         filteredOptions.filter((o) => !o.disabled).length - 1
  //       ) {
  //         setArrowSelected(arrowSelected + 1);
  //       }
  //       break;
  //     case 'ArrowUp':
  //       e.preventDefault();
  //       setShowOptions(true);
  //       if (arrowSelected && arrowSelected > 0) {
  //         setArrowSelected(arrowSelected - 1);
  //       }
  //       break;
  //     case 'Enter':
  //       e.preventDefault();
  //       if (arrowSelected !== null) {
  //         const option = filteredOptions.filter((o) => !o.disabled)[
  //           arrowSelected
  //         ];
  //         onInternalChange(option.value, option.label);
  //         setShowOptions(false);
  //       }
  //       break;
  //     default:
  //       setArrowSelected(null);
  //   }
  // };

  let refCount = -1;
  return (
    <div>
      <AppTextInput<T>
        {...remainingProps}
        // id={selectId.current}
        className="select-search-input"
        autoComplete="off"
        onChange={(e) => onTextInternalChange(e.target.value)}
        onFocus={onInternalFocus}
        onBlur={onInternalBlur}
        // onKeyDown={onInternalKeyDown}
        value={internalLabel}
        inputForm={inputForm}
        inputKey={inputKey}
        inputPathFromKey={inputPathFromKey}
        whenValid={whenValid}
      />
      <div
        ref={optionsContainerRef}
        className={clsx('select-search-options', 'midlength-input', {
          'select-search-options__visible': showOptions,
        })}
      >
        {filteredOptions.length === 0 ? (
          <div className="select-search-option__disabled">Aucun résultat</div>
        ) : (
          <>
            {filteredOptions.map((option) => {
              if (!option.disabled) {
                refCount += 1;
              }
              return (
                <div
                  role="option"
                  // aria-selected={selected === option.value}
                  ref={option.disabled ? null : optionsRef.current[refCount]}
                  className={clsx('select-search-option', {
                    'select-search-option__selected':
                      !option.disabled && refCount === arrowSelected,
                    'select-search-option__disabled': option.disabled,
                  })}
                  // disabled={option.disabled || false}
                  hidden={option.hidden || false}
                  // key={`${selectId}-${option.value}`}
                  // value={option.value}
                  onMouseDown={() =>
                    onInternalChange(option.value, option.label)
                  }
                >
                  {option.label}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

AppSearchableSelect.defaultProps = {
  className: '',
  disabled: false,
  hint: '',
  id: null,
  label: '',
  message: '',
  messageType: undefined,
  name: null,
  onChange: () => {},
  onTextChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  onKeyDown: () => {},
  placeholder: 'Chercher une valeur',
  selected: '',
  required: false,
};

export default AppSearchableSelect;
