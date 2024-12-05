import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  isCreatedSample,
  Sample,
  SampleToCreate
} from 'shared/schema/Sample/Sample';
import { SampleItem } from 'shared/schema/Sample/SampleItem';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useOnLine } from 'src/hooks/useOnLine';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import {
  getSupportDocumentURL,
  useCreateOrUpdateSampleMutation
} from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SendingModal from 'src/views/SampleView/DraftSample/SendingStep/SendingModal';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import ContextStepSummary from 'src/views/SampleView/StepSummary/ContextStepSummary';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';

interface Props {
  sample: Sample | SampleToCreate;
}

const SendingStep = ({ sample }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { hasUserPermission } = useAuthentication();
  const { isOnline } = useOnLine();
  const { laboratory } = usePartialSample(sample);

  const [items, setItems] = useState<SampleItem[]>(sample.items);
  const [resytalId, setResytalId] = useState(sample.resytalId);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample, { isError }] = useCreateOrUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`
  });

  const isSendable = useMemo(
    () => Sample.safeParse(sample).success && isOnline,
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
    items: true,
    resytalId: true
  });

  type FormShape = typeof Form.shape;

  const submit = async () => {
    await save('Sent', () => {
      navigateToSample(sample.id);
    });
  };

  const save = async (status = sample.status, callback?: () => void) => {
    setIsSaved(false);
    await form.validate(async () => {
      await createOrUpdateSample({
        ...sample,
        items,
        resytalId,
        status
      });
      callback?.();
    });
  };

  const changeItems = (item: SampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  const form = useForm(
    Form,
    {
      items,
      resytalId
    },
    save
  );

  return (
    <>
      <div data-testid="sample_data" className="sample-form">
        <h3 className={cx('fr-m-0')}>
          Récapitulatif du prélèvement{' '}
          {isCreatedSample(sample) && sample.reference}
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
        <h3 className={cx('fr-m-0')}>
          {pluralize(sample.items.length)('Échantillon prélevé')}
        </h3>
        <ItemsStepSummary
          sample={{
            ...sample,
            items
          }}
          itemChildren={(item, itemIndex) => (
            <>
              <hr className={cx('fr-m-0')} />
              {isOnline ? (
                <div>
                  <h6>
                    Document d'accompagnement du prélèvement / Procès verbal
                  </h6>
                  <ButtonsGroup
                    inlineLayoutWhen="always"
                    buttons={[
                      {
                        children: 'Aperçu',
                        iconId: 'fr-icon-external-link-line',
                        priority: 'secondary',
                        onClick: () =>
                          window.open(
                            getSupportDocumentURL(sample.id, itemIndex + 1)
                          )
                      },
                      {
                        children: 'Imprimer',
                        iconId: 'fr-icon-file-pdf-line',
                        onClick: () =>
                          window.open(
                            getSupportDocumentURL(sample.id, itemIndex + 1)
                          )
                      }
                    ]}
                  />
                </div>
              ) : (
                <div className="d-flex-align-center">
                  <span
                    className={cx('fr-icon-warning-line', 'fr-mr-1w')}
                  ></span>
                  Le document d'accompagnement du prélèvement / Procès verbal
                  sera disponible lorsque la connexion Internet sera rétablie.
                </div>
              )}
              <hr className={cx('fr-m-0')} />
              <div>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <h6>
                      Envoyer le procès verbal au détenteur de la marchandise
                    </h6>
                  </div>
                </div>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-6', 'fr-col-sm-3')}>
                    <AppTextInput<FormShape>
                      value={item.ownerLastName ?? ''}
                      onChange={(e) =>
                        changeItems(
                          { ...item, ownerLastName: e.target.value },
                          itemIndex
                        )
                      }
                      inputForm={form}
                      inputKey="items"
                      inputPathFromKey={[itemIndex, 'ownerLastName']}
                      whenValid="Nom valide"
                      label="Identité du détenteur"
                      hintText="Nom"
                    />
                  </div>
                  <div className={cx('fr-col-6', 'fr-col-sm-3')}>
                    <AppTextInput<FormShape>
                      value={item.ownerFirstName ?? ''}
                      onChange={(e) =>
                        changeItems(
                          { ...item, ownerFirstName: e.target.value },
                          itemIndex
                        )
                      }
                      inputForm={form}
                      inputKey="items"
                      inputPathFromKey={[itemIndex, 'ownerFirstName']}
                      whenValid="Prénom valide"
                      hintText="Prénom"
                    />
                  </div>
                  <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                    <AppTextInput<FormShape>
                      value={item.ownerEmail ?? ''}
                      onChange={(e) =>
                        changeItems(
                          { ...item, ownerEmail: e.target.value },
                          itemIndex
                        )
                      }
                      type="email"
                      inputForm={form}
                      inputKey="items"
                      inputPathFromKey={[itemIndex, 'ownerEmail']}
                      whenValid="Email valide"
                      label="E-mail du détenteur"
                      hintText="Le détenteur recevra une copie du procès verbal"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        />
        {!isSendable && (
          <Alert
            severity="warning"
            description={
              <>
                En l’absence de connexion lors de la saisie, certaines
                informations n’ont pu être validées (<b>entité contrôlée</b> et
                <b> localisation de la parcelle</b>)
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
                            await save(sample.status, () => setIsSaved(true));
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
