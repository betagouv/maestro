import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sample } from 'shared/schema/Sample/Sample';
import { SampleItem } from 'shared/schema/Sample/SampleItem';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useForm } from 'src/hooks/useForm';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import {
  getSupportDocumentURL,
  useUpdateSampleItemsMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SendingModal from 'src/views/SampleView/DraftSample/SendingStep/SendingModal';
import CreationStepSummary from 'src/views/SampleView/StepSummary/CreationStepSummary';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';

interface Props {
  sample: Sample;
}

const SendingStep = ({ sample }: Props) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthentication();

  const [items, setItems] = useState<SampleItem[]>(sample.items);

  const [updateSampleItems] = useUpdateSampleItemsMutation();
  const [updateSample, { isError }] = useUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`,
  });

  const { data: laboratory } = useGetLaboratoryQuery(
    sample.laboratoryId ?? skipToken
  );

  const sendingSampleModal = useMemo(
    () =>
      createModal({
        id: `sending-sample-modal-${sample.id}`,
        isOpenedByDefault: false,
      }),
    [sample.id]
  );

  const Form = Sample.pick({
    items: true,
  });

  type FormShape = typeof Form.shape;

  const submit = async () => {
    await updateSample({
      ...sample,
      status: 'Sent',
      sentAt: new Date(),
    });
    navigate(`/prelevements/${sample.id}`, {
      replace: true,
    });
  };

  const save = async (status = sample.status) => {
    await updateSampleItems({
      id: sample.id,
      items,
    });
    await updateSample({
      ...sample,
      status,
    });
  };

  const changeItems = (item: SampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    console.log(newItems);
    setItems(newItems);
  };

  const form = useForm(
    Form,
    {
      items,
    },
    save
  );

  return (
    <>
      <div data-testid="sample_data" className="sample-form">
        <h3 className={cx('fr-m-0')}>
          Récapitulatif du prélèvement {sample.reference}
          {hasPermission('updateSample') && (
            <div className={cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}>
              Vérifiez l’ensemble des informations avant de finaliser votre
              envoi
            </div>
          )}
        </h3>
        <CreationStepSummary partialSample={sample} />
        <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
        <MatrixStepSummary sample={sample} />
        <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
        <h3 className={cx('fr-m-0')}>
          {pluralize(sample.items.length)('Échantillon prélevé')}
        </h3>
        <ItemsStepSummary
          sample={{
            ...sample,
            items,
          }}
          itemChildren={(item, itemIndex) => (
            <>
              <hr className={cx('fr-m-0')} />
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
                        ),
                    },
                    {
                      children: 'Imprimer',
                      iconId: 'fr-icon-file-pdf-line',
                      onClick: () =>
                        window.open(
                          getSupportDocumentURL(sample.id, itemIndex + 1)
                        ),
                    },
                  ]}
                />
              </div>
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
        {isError ? (
          <Alert
            severity={'error'}
            description="Une erreur est survenue lors de l'envoi, veuillez réessayer."
            small
          />
        ) : (
          <hr className={cx('fr-mx-0')} />
        )}
        {hasPermission('updateSample') && (
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
                        currentStep: 4,
                      }),
                      {
                        children: 'Enregistrer',
                        iconId: 'fr-icon-save-line',
                        priority: 'tertiary',
                        onClick: async (e: React.MouseEvent<HTMLElement>) => {
                          e.preventDefault();
                          await save();
                        },
                      },
                    ] as any
                  }
                />
              </li>
              <li>
                {laboratory ? (
                  <Button
                    iconId="fr-icon-send-plane-fill"
                    iconPosition="right"
                    priority="primary"
                    onClick={async () => {
                      await form.validate(async () =>
                        sendingSampleModal.open()
                      );
                    }}
                  >
                    Envoyer la demande d’analyse
                  </Button>
                ) : (
                  <Alert severity={'error'} title={'Laboratoire non trouvé'} />
                )}
              </li>
            </ul>
          </div>
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
