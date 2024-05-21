import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dataAttributes from './data-attributes';

type SelectWrapperHint = string | Object | any[];

type SelectWrapperMessageType = 'error' | 'valid';

interface SelectWrapperProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hint?: SelectWrapperHint;
  label?: string;
  message?: string;
  messageType?: SelectWrapperMessageType;
  onChange?: (...args: any[]) => any;
  required?: boolean;
  selectId: string;
}

const SelectWrapper = ({
  children,
  className,
  disabled,
  hint,
  label,
  message,
  messageType,
  required,
  selectId,
  ...remainingProps
}: SelectWrapperProps) => {
  const hintId = useRef(uuidv4());
  const _classNameWrapper = clsx(
    'fr-select-group',
    {
      [`fr-select-group--${messageType}`]: messageType,
      'fr-select-group--disabled': disabled,
    },
    className
  );

  return (
    <div
      className={_classNameWrapper}
      {...dataAttributes.getAll(remainingProps)}
    >
      {label && (
        <label
          className="fr-label"
          htmlFor={selectId}
          aria-describedby={hint && hintId.current}
        >
          {label}
          {required && <span className="error"> *</span>}
          {hint && (
            <p id={hintId.current} className="fr-hint-text">
              {hint.toString()}
            </p>
          )}
        </label>
      )}
      {children}
      {message && messageType && (
        <p className={`fr-${messageType}-text`}>{message}</p>
      )}
    </div>
  );
};

SelectWrapper.defaultProps = {
  className: '',
  disabled: false,
  hint: '',
  label: '',
  message: '',
  messageType: undefined,
  required: false,
};

SelectWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  hint: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  label: PropTypes.string,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(['error', 'valid']),
  required: PropTypes.bool,
  selectId: PropTypes.string.isRequired,
};

export default SelectWrapper;
