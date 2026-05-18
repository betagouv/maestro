import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  LaboratoryConfigUpdate,
  type LaboratoryWithSacha,
  SachaConfig
} from 'maestro-shared/schema/Laboratory/Laboratory';
import { useContext, useMemo, useState } from 'react';
import AppServiceErrorAlert from 'src/components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppMultipleInput from 'src/components/_app/AppTextInput/AppMultipleInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { useForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import z from 'zod';

type FormState = {
  emails: string[];
  emailsAnalysisResult: string[];
  legacyDai: boolean;
  sachaActivated: boolean;
  sachaSigle: string;
  sachaMethod: 'EMAIL' | 'SFTP' | 'NONE';
  sachaEmail: string;
  sachaGpgPublicKey: string;
  sachaSftpLogin: string;
};

const LaboratoryConfigFormSchema = z.object({
  emails: z.array(z.email()),
  emailsAnalysisResult: z.array(z.email()),
  legacyDai: z.boolean(),
  sacha: SachaConfig.nullable()
});
type LaboratoryConfigForm = z.infer<typeof LaboratoryConfigFormSchema>;

const buildSacha = (state: FormState): SachaConfig | null => {
  if (state.legacyDai) return null;
  const communication =
    state.sachaMethod === 'EMAIL'
      ? {
          method: 'EMAIL' as const,
          email: state.sachaEmail,
          gpgPublicKey: state.sachaGpgPublicKey
        }
      : state.sachaMethod === 'SFTP'
        ? { method: 'SFTP' as const, sftpLogin: state.sachaSftpLogin }
        : null;
  return {
    activated: state.sachaActivated,
    sigle: state.sachaSigle.trim() === '' ? null : state.sachaSigle.trim(),
    communication
  };
};

const buildPayload = (state: FormState): LaboratoryConfigForm => ({
  emails: state.emails,
  emailsAnalysisResult: state.emailsAnalysisResult,
  legacyDai: state.legacyDai,
  sacha: state.legacyDai ? null : buildSacha(state)
});

const initialState = (lab: LaboratoryWithSacha): FormState => ({
  emails: [...lab.emails],
  emailsAnalysisResult: [...lab.emailsAnalysisResult],
  legacyDai: lab.legacyDai,
  sachaActivated: lab.sacha?.activated ?? false,
  sachaSigle: lab.sacha?.sigle ?? '',
  sachaMethod:
    lab.sacha?.communication?.method === 'EMAIL'
      ? 'EMAIL'
      : lab.sacha?.communication?.method === 'SFTP'
        ? 'SFTP'
        : 'NONE',
  sachaEmail:
    lab.sacha?.communication?.method === 'EMAIL'
      ? lab.sacha.communication.email
      : '',
  sachaGpgPublicKey:
    lab.sacha?.communication?.method === 'EMAIL'
      ? lab.sacha.communication.gpgPublicKey
      : '',
  sachaSftpLogin:
    lab.sacha?.communication?.method === 'SFTP'
      ? lab.sacha.communication.sftpLogin
      : ''
});

type Props = {
  laboratory: LaboratoryWithSacha;
};

export const LaboratoryConfigForm = ({ laboratory }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [updateConfig, updateResult] =
    apiClient.useUpdateLaboratoryConfigMutation();

  const [state, setState] = useState<FormState>(() => initialState(laboratory));
  const [toastOpen, setToastOpen] = useState(false);

  const payload = useMemo(() => buildPayload(state), [state]);

  const form = useForm(LaboratoryConfigFormSchema, payload);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    await form.validate(async (valid) => {
      const parsed = LaboratoryConfigUpdate.safeParse(valid);
      if (!parsed.success) {
        return;
      }
      try {
        await updateConfig({
          laboratoryId: laboratory.id,
          ...parsed.data
        }).unwrap();
        setToastOpen(true);
      } catch (_err) {
        /* erreur affichée via AppServiceErrorAlert */
      }
    });
  };

  return (
    <form
      className={clsx('bg-white', cx('fr-p-2w'))}
      onSubmit={(e) => e.preventDefault()}
    >
      <h3>{laboratory.shortName} — Configuration</h3>

      <AppMultipleInput
        label="Emails de contact"
        values={state.emails}
        onChange={(values) => setField('emails', values)}
        inputForm={form}
        inputKey="emails"
        addLabel="Ajouter un email"
        placeholder="exemple@labo.fr"
      />

      <AppMultipleInput
        label="Emails expéditeurs des résultats d'analyse"
        hintText="Adresses qui peuvent envoyer des résultats d'analyse à Maestro"
        values={state.emailsAnalysisResult}
        onChange={(values) => setField('emailsAnalysisResult', values)}
        inputForm={form}
        inputKey="emailsAnalysisResult"
        addLabel="Ajouter un email"
        placeholder="exemple@labo.fr"
      />

      <div className={cx('fr-my-2w')}>
        <ToggleSwitch
          label="DAI historique (legacyDai)"
          helperText="Si activé, ce laboratoire n'utilise pas SACHA — tous les champs SACHA sont remis à zéro."
          checked={state.legacyDai}
          labelPosition="left"
          onChange={(checked) => setField('legacyDai', checked)}
        />
      </div>

      {!state.legacyDai && (
        <fieldset className={cx('fr-fieldset', 'fr-mt-2w')}>
          <legend className={cx('fr-fieldset__legend')}>
            Configuration SACHA
          </legend>

          <div className={cx('fr-fieldset__element')} style={{ width: '100%' }}>
            <ToggleSwitch
              label="SACHA activé"
              checked={state.sachaActivated}
              labelPosition="left"
              onChange={(checked) => setField('sachaActivated', checked)}
            />
          </div>

          <div className={cx('fr-fieldset__element')} style={{ width: '100%' }}>
            <AppTextInput
              label="Sigle SACHA"
              value={state.sachaSigle}
              onChange={(e) => setField('sachaSigle', e.target.value)}
              inputForm={form}
              inputKey="sacha"
              inputPathFromKey={['sigle']}
            />
          </div>

          <div className={cx('fr-fieldset__element')} style={{ width: '100%' }}>
            <AppRadioButtons
              legend="Méthode de communication"
              options={[
                {
                  label: 'Aucune',
                  nativeInputProps: {
                    checked: state.sachaMethod === 'NONE',
                    onChange: () => setField('sachaMethod', 'NONE')
                  }
                },
                {
                  label: 'Email',
                  nativeInputProps: {
                    checked: state.sachaMethod === 'EMAIL',
                    onChange: () => setField('sachaMethod', 'EMAIL')
                  }
                },
                {
                  label: 'SFTP',
                  nativeInputProps: {
                    checked: state.sachaMethod === 'SFTP',
                    onChange: () => setField('sachaMethod', 'SFTP')
                  }
                }
              ]}
              inputForm={form}
              inputKey="sacha"
              inputPathFromKey={['communication', 'method']}
            />
          </div>

          {state.sachaMethod === 'EMAIL' && (
            <>
              <div
                className={cx('fr-fieldset__element')}
                style={{ width: '100%' }}
              >
                <AppTextInput
                  label="Email SACHA"
                  value={state.sachaEmail}
                  onChange={(e) => setField('sachaEmail', e.target.value)}
                  inputForm={form}
                  inputKey="sacha"
                  inputPathFromKey={['communication', 'email']}
                  required
                />
              </div>
              <div
                className={cx('fr-fieldset__element')}
                style={{ width: '100%' }}
              >
                <AppTextAreaInput
                  label="Clé publique GPG"
                  value={state.sachaGpgPublicKey}
                  onChange={(e) =>
                    setField('sachaGpgPublicKey', e.target.value)
                  }
                  inputForm={form}
                  inputKey="sacha"
                  inputPathFromKey={['communication', 'gpgPublicKey']}
                  required
                />
              </div>
            </>
          )}

          {state.sachaMethod === 'SFTP' && (
            <div
              className={cx('fr-fieldset__element')}
              style={{ width: '100%' }}
            >
              <AppTextInput
                label="Login SFTP"
                value={state.sachaSftpLogin}
                onChange={(e) => setField('sachaSftpLogin', e.target.value)}
                inputForm={form}
                inputKey="sacha"
                inputPathFromKey={['communication', 'sftpLogin']}
                required
              />
            </div>
          )}
        </fieldset>
      )}

      <AppServiceErrorAlert call={updateResult} />

      <Button
        priority="primary"
        onClick={submit}
        iconId="fr-icon-save-line"
        iconPosition="right"
        className={cx('fr-mt-2w')}
      >
        Enregistrer
      </Button>

      <AppToast
        open={toastOpen}
        description="Configuration enregistrée"
        onClose={() => setToastOpen(false)}
      />
    </form>
  );
};
