import { useState } from 'react';

import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { SignIn } from 'shared/schema/SignIn';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useForm } from 'src/hooks/useForm';
import { useAppDispatch } from 'src/hooks/useStore';
import { useSignInMutation } from 'src/services/account.service';
import authSlice from 'src/store/reducers/authSlice';
import farmhand from '../../assets/farmland.webp';
import foodGreen from '../../assets/illustrations/food-green.svg';
import './HomeView.scss';

const HomeView = () => {
  useDocumentTitle('Connexion');
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState(false);

  const [signIn] = useSignInMutation();

  const form = useForm(SignIn, {
    email,
    password,
  });

  type SignInShape = typeof SignIn.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    await form.validate(async () => {
      signIn({
        email,
        password,
      })
        .unwrap()
        .then((authUser) => {
          dispatch(authSlice.actions.signinUser({ authUser }));
        })
        .catch(() => {
          setSignInError(true);
        });
    });
  };

  return (
    <section
      className={clsx(
        cx('fr-grid-row', 'fr-grid-row--gutters'),
        'home-section'
      )}
    >
      <div className={cx('fr-col-12', 'fr-col-md-6')}>
        <div className={clsx('sign-in')}>
          <h2>Identifiez-vous pour accéder à votre espace maestro</h2>
          <form id="login_form">
            <AppTextInput<SignInShape>
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputForm={form}
              inputKey="email"
              whenValid="E-mail correctement renseigné."
              data-testid="email-input"
              label="E-mail"
              required
            />
            <AppTextInput<SignInShape>
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputForm={form}
              inputKey="password"
              whenValid="Mot de passe correctement renseigné."
              data-testid="password-input"
              label="Mot de passe"
              required
            />
            {signInError && (
              <div data-testid="alert-error" className="fr-my-2w">
                <Alert
                  title="Erreur"
                  description="Echec de la connexion"
                  severity="error"
                />
              </div>
            )}
            <Button
              data-testid="login-button"
              onClick={submit}
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
            >
              Se connecter
            </Button>
          </form>
        </div>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6')}>
        <div
          style={{
            backgroundImage: `url(${farmhand})`,
            backgroundSize: 'cover',
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
};

export default HomeView;
