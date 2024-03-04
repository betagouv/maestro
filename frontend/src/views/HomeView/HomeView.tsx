import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';

const HomeView = () => {
  useDocumentTitle('Accueil');

  return (
    <section className={cx('fr-py-6w')}>
      <h1>Bienvenue</h1>
    </section>
  );
};

export default HomeView;
