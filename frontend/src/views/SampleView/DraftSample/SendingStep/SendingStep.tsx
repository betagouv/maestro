import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  isCreatedPartialSample,
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'shared/schema/Sample/Sample';
import { isDefined } from 'shared/utils/utils';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import SupportDocumentSelect from 'src/components/SupportDocumentSelect/SupportDocumentSelect';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useOnLine } from 'src/hooks/useOnLine';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useCreateOrUpdateSampleMutation } from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SendingModal from 'src/views/SampleView/DraftSample/SendingStep/SendingModal';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import ContextStepSummary from 'src/views/SampleView/StepSummary/ContextStepSummary';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
}

const SendingStep = ({ sample }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { hasUserPermission } = useAuthentication();
  const { isOnline } = useOnLine();
  const { laboratory } = usePartialSample(sample);

  const [resytalId, setResytalId] = useState(sample.resytalId);
  const [ownerFirstName, setOwnerFirstName] = useState(sample.ownerFirstName);
  const [ownerLastName, setOwnerLastName] = useState(sample.ownerLastName);
  const [ownerEmail, setOwnerEmail] = useState(sample.ownerEmail);
  const [ownerAgreement, setOwnerAgreement] = useState(sample.ownerAgreement);
  const [notesOnOwnerAgreement, setNotesOnOwnerAgreement] = useState(
    sample.notesOnOwnerAgreement
  );
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample, { isError }] = useCreateOrUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`
  });

  const isSendable = useMemo(
    () =>
      SampleToCreate.merge(SampleOwnerData.partial()).safeParse(sample)
        .success && isOnline,
    [sample, isOnline]
  );

  const sendingSampleModal = useMemo(
    () =>
      createModal({
        id: `sending-sample-modal-${sample.id}`,
        isOpenedByDefault: false
      }),
    [sample.id]
  );

  const Form = Sample.pick({
    resytalId: true,
    ownerFirstName: true,
    ownerLastName: true,
    ownerEmail: true,
    ownerAgreement: true,
    notesOnOwnerAgreement: true
  });

  type FormShape = typeof Form.shape;

  const submit = async () => {
    await form.validate(async () => {
      await save('Sent');
      navigateToSample(sample.id);
    });
  };

  const save = async (status = sample.status) => {
    setIsSaved(false);
    await createOrUpdateSample({
      ...sample,
      resytalId,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerAgreement,
      notesOnOwnerAgreement,
      status
    });
  };

  const form = useForm(
    Form,
    {
      resytalId,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerAgreement,
      notesOnOwnerAgreement
    },
    save
  );

  return (
    <>
      <div data-testid="sample_data" className="sample-form">
        <h3 className={cx('fr-m-0')}>
          Récapitulatif du prélèvement{' '}
          {isCreatedPartialSample(sample) && sample.reference}
          {hasUserPermission('updateSample') && (
            <div className={cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}>
              Vérifiez l’ensemble des informations avant de finaliser votre
              envoi
            </div>
          )}
        </h3>
        <ContextStepSummary sample={sample} onChangeResytalId={setResytalId} />
        <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
        <MatrixStepSummary sample={sample} />
        <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
        <ItemsStepSummary sample={sample} />
        <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
        <h3 className={cx('fr-m-0')}>Consentement par le détenteur</h3>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppRadioButtons<FormShape>
              legend="Le détenteur accepte les informations portées au présent procès verbal"
              options={[
                {
                  label: 'Oui',
                  nativeInputProps: {
                    checked: ownerAgreement,
                    onChange: () => setOwnerAgreement(true)
                  }
                },
                {
                  label: 'Non',
                  nativeInputProps: {
                    checked: isDefined(ownerAgreement) && !ownerAgreement,
                    onChange: () => setOwnerAgreement(false)
                  }
                }
              ]}
              inputForm={form}
              inputKey="ownerAgreement"
              required
            />
          </div>
        </div>

        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput<FormShape>
              rows={1}
              defaultValue={notesOnOwnerAgreement ?? ''}
              onChange={(e) => setNotesOnOwnerAgreement(e.target.value)}
              inputForm={form}
              inputKey="notesOnOwnerAgreement"
              whenValid="Déclaration correctement renseignée."
              label="Déclaration du détenteur"
              hintText="Champ facultatif pour spécifier une éventuelle déclaration du détenteur"
            />
          </div>
        </div>
        {isOnline ? (
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <SupportDocumentSelect
                label="Document d'accompagnement du prélèvement / Procès verbal"
                sample={sample}
                renderButtons={(onClick) => (
                  <ButtonsGroup
                    inlineLayoutWhen="always"
                    buttons={[
                      {
                        children: 'Aperçu',
                        iconId: 'fr-icon-external-link-line',
                        priority: 'secondary',
                        className: cx('fr-mb-0'),
                        onClick
                      },
                      {
                        children: 'Imprimer',
                        iconId: 'fr-icon-file-pdf-line',
                        className: cx('fr-mb-0'),
                        onClick
                      }
                    ]}
                  />
                )}
              />
            </div>
          </div>
        ) : (
          <div className="d-flex-align-center">
            <span className={cx('fr-icon-warning-line', 'fr-mr-1w')}></span>
            Le document d'accompagnement du prélèvement / Procès verbal sera
            disponible lorsque la connexion Internet sera rétablie.
          </div>
        )}
        <div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12', 'fr-mb-1w')}>
              <h6 className={cx('fr-mb-0')}>
                Envoyer le procès verbal au détenteur de la marchandise
              </h6>
              {sample.items.length}{' '}
              {pluralize(sample.items.length)("document d'accompagnement")}
            </div>
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-6', 'fr-col-sm-3')}>
              <AppTextInput<FormShape>
                value={ownerLastName ?? ''}
                onChange={(e) => setOwnerLastName(e.target.value)}
                inputForm={form}
                inputKey="ownerLastName"
                whenValid="Nom valide"
                label="Identité du détenteur"
                hintText="Nom"
              />
            </div>
            <div className={cx('fr-col-6', 'fr-col-sm-3')}>
              <AppTextInput<FormShape>
                value={ownerFirstName ?? ''}
                onChange={(e) => setOwnerFirstName(e.target.value)}
                inputForm={form}
                inputKey="ownerFirstName"
                whenValid="Prénom valide"
                hintText="Prénom"
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              <AppTextInput<FormShape>
                value={ownerEmail ?? ''}
                onChange={(e) => setOwnerEmail(e.target.value)}
                type="email"
                inputForm={form}
                inputKey="ownerEmail"
                whenValid="Email valide"
                label="E-mail du détenteur"
                hintText="Le détenteur recevra une copie du procès verbal"
              />
            </div>
          </div>
        </div>
        {!isSendable && (
          <Alert
            severity="warning"
            description={
              <>
                En l’absence de connexion lors de la saisie, certaines
                informations n’ont pu être validées (<b>entité contrôlée</b> et
                <b> localisation de la parcelle</b>)
                <div>
                  <Link
                    to=""
                    onClick={async (e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      await save('Draft');
                      navigateToSample(sample.id, 1);
                    }}
                  >
                    Compléter ces informations
                  </Link>
                </div>
              </>
            }
            small
          />
        )}
        {isError ? (
          <Alert
            severity="error"
            description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
            small
          />
        ) : (
          <hr className={cx('fr-mx-0')} />
        )}
        {hasUserPermission('updateSample') && (
          <>
            <div className="sample-actions">
              <ul
                className={cx(
                  'fr-btns-group',
                  'fr-btns-group--inline-md',
                  'fr-btns-group--between',
                  'fr-btns-group--icon-left'
                )}
              >
                <li>
                  <ButtonsGroup
                    alignment="left"
                    inlineLayoutWhen="md and up"
                    buttons={
                      [
                        PreviousButton({
                          sampleId: sample.id,
                          onSave: async () => save('DraftItems'),
                          currentStep: 4
                        }),
                        {
                          children: 'Enregistrer',
                          iconId: 'fr-icon-save-line',
                          priority: 'tertiary',
                          onClick: async (e: React.MouseEvent<HTMLElement>) => {
                            e.preventDefault();
                            await save(sample.status);
                            setIsSaved(true);
                          }
                        }
                      ] as any
                    }
                  />
                </li>
                <li>
                  {laboratory && (
                    <Button
                      iconId="fr-icon-send-plane-fill"
                      iconPosition="right"
                      priority="primary"
                      onClick={async () => {
                        await form.validate(async () =>
                          sendingSampleModal.open()
                        );
                      }}
                      disabled={!isSendable}
                    >
                      Envoyer la demande d’analyse
                    </Button>
                  )}
                </li>
              </ul>
            </div>
            <SavedAlert isOpen={isSaved} />
          </>
        )}
      </div>
      {laboratory && (
        <SendingModal
          modal={sendingSampleModal}
          laboratory={laboratory}
          onConfirm={submit}
        />
      )}
    </>
  );
};

export default SendingStep;
