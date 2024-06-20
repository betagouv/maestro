import { cx } from '@codegouvfr/react-dsfr/fr/cx';

const AppRequiredText = () => {
  return (
    <p className={cx('fr-text--sm', 'fr-m-0')}>
      Les champs marqués du symbole{' '}
      <span className={cx('fr-label--error')}>*</span> sont obligatoires.
    </p>
  );
};

export default AppRequiredText;
