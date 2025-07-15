import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Link } from 'react-router';
import './UserFeedback.scss';

const UserFeedback = () => {
  return (
    <div className="user-feedback-container">
      <h4 className={cx('fr-mt-5w', 'fr-mb-2w')}>
        Aidez-nous à améliorer Maestro
      </h4>
      <div
        className={cx(
          'fr-text--lg',
          'fr-text--regular',
          'fr-hint-text',
          'fr-mb-3w'
        )}
      >
        Donnez-nous votre avis sur le service en moins de 2 minutes.
      </div>
      <Link
        to="https://jedonnemonavis.numerique.gouv.fr/Demarches/3626?button=3909"
        target="_blank"
        title="Je donne mon avis - nouvelle fenêtre"
      >
        <img
          src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg"
          alt="Je donne mon avis"
        />
      </Link>
    </div>
  );
};

export default UserFeedback;
