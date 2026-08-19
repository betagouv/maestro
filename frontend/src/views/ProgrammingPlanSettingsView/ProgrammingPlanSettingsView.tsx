import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { AppPageWithYearTitle } from 'src/components/_app/AppPage/AppPageWithYearTitle';
import { assert, type Equals } from 'tsafe';

type Props = Record<never, never>;

export const ProgrammingPlanSettingsView = ({ ..._rest }: Props = {}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <AppPageWithYearTitle
      title="Paramétrage des plans"
      render={() => (
        <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
          {/* TODO: content of the tab */}
        </div>
      )}
    />
  );
};
