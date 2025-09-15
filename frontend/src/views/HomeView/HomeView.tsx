import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect
} from 'react';

import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Brand } from 'maestro-shared/constants';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import farmhand from '../../assets/farmland.webp';
import foodGreen from '../../assets/illustrations/food-green.svg';
import { ApiClientContext } from '../../services/apiClient';
import './HomeView.scss';

const HomeView = () => {
  useDocumentTitle('Connexion');
  const apiClient = useContext(ApiClientContext);
  const { data: authRedirectUrl } = apiClient.useGetAuthRedirectUrlQuery();

  useEffect(() => {
    if (authRedirectUrl) {
      if (authRedirectUrl.nonce) {
        sessionStorage.setItem('nonce', authRedirectUrl.nonce);
      }
      if (authRedirectUrl.state) {
        sessionStorage.setItem('state', authRedirectUrl.state);
      }
    }
  }, [authRedirectUrl]);

  return (
    <HomeViewContainer>
      <h2 className={cx('fr-mb-2w')}>
        Identifiez-vous pour accéder à votre espace {Brand}
      </h2>
      <div className={cx('fr-text--lg', 'fr-mb-5w')}>
        EAP est la solution proposée par le ministère de l'agriculture pour
        sécuriser et simplifier la connexion à vos services en ligne.
      </div>
      {authRedirectUrl && (
        <Button
          size="large"
          iconId="fr-icon-user-line"
          linkProps={{
            href: authRedirectUrl.url,
            rel: 'noopener',
            title: `connexion avec EAP`
          }}
        >
          Connexion avec EAP
        </Button>
      )}
    </HomeViewContainer>
  );
};

export const HomeViewContainer: FunctionComponent<PropsWithChildren> = ({
  children
}) => (
  <section
    className={clsx(
      cx('fr-grid-row', 'fr-grid-row--gutters'),
      'home-section',
      'd-flex-align-center'
    )}
  >
    <div className={cx('fr-col-12', 'fr-col-md-6')}>
      <div className={clsx('sign-in')}>{children}</div>
    </div>
    <div className={cx('fr-col-12', 'fr-col-md-6')} style={{ height: '100%' }}>
      <div
        style={{
          backgroundImage: `url(${farmhand})`,
          backgroundSize: 'cover',
          height: '100%'
        }}
      >
        <div className={clsx('teaser')}>
          <img src={foodGreen} aria-hidden alt="" />
          <h1>
            <b>Surveillance</b> et <b>contrôle</b> officiels sur la{' '}
            <b>chaine alimentaire</b>
          </h1>
          <div className="title-additionnal">
            permettant la circulation et l'accès en temps réel à une donnée
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeView;
