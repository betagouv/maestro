import { cx } from '@codegouvfr/react-dsfr/fr/cx';

const AppRequiredInput = () => {
  return <span className={cx('fr-label--error', 'fr-mx-1w')}>*</span>;
};

export default AppRequiredInput;
