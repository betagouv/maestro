import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';

const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');

  return (
    <section className={cx('fr-py-6w')}>
      <h1>Liste des prélèvements</h1>
      <Button
        linkProps={{
          to: '/prelevements/nouveau',
          target: '_self',
        }}
      >
        Créer un prélèvement
      </Button>
    </section>
  );
};

export default SampleListView;
