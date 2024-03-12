import { useState } from 'react';

import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SignIn } from 'shared/schema/SignIn';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useForm } from 'src/hooks/useForm';
import { useAppDispatch } from 'src/hooks/useStore';
import { useSignInMutation } from 'src/services/account.service';
import authSlice from 'src/store/reducers/authSlice';

const SignInView = () => {
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
    <section className={cx('fr-py-3w', 'fr-px-0', 'fr-px-md-16w')}>
      <h1>Connexion</h1>
      <form id="login_form">
        <AppTextInput<SignInShape>
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputForm={form}
          inputKey="email"
          whenValid="Email correctement renseigné."
          data-testid="email-input"
          label="Adresse email (obligatoire)"
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
          label="Mot de passe (obligatoire)"
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
        <Button data-testid="login-button" onClick={submit}>
          Se connecter
        </Button>
      </form>
    </section>
  );
};

export default SignInView;
