import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';

interface Props {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  variant?: 'header' | 'row';
}

const SelectionCheckbox = ({
  checked,
  indeterminate,
  disabled,
  onChange,
  variant = 'row'
}: Props) => {
  const checkbox = (
    <Checkbox
      options={[
        {
          label: '',
          nativeInputProps: {
            checked,
            disabled,
            onChange,
            ref: (el: HTMLInputElement | null) => {
              if (el) {
                el.indeterminate = indeterminate ?? false;
              }
            }
          }
        }
      ]}
      small
      className={cx('fr-pb-3w')}
    />
  );
  return variant === 'header' ? (
    <div className={clsx(cx('fr-checkbox-group'), 'selectable-cell')}>
      {checkbox}
    </div>
  ) : (
    <div className="selectable-cell">{checkbox}</div>
  );
};

export default SelectionCheckbox;
