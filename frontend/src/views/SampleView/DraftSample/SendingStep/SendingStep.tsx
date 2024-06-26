import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sample } from 'shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import {
  getSupportDocumentURL,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
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
  const [updateSample, { isError }] = useUpdateSampleMutation({
    fixedCacheKey: `sending-sample-${sample.id}`,
  });

  const { data: laboratory } = useGetLaboratoryQuery(
    sample.laboratoryId ?? skipToken
  );

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
    await updateSample({
      ...sample,
      status,
    });
  };

  return (
    <div data-testid="sample_data" className="sample-form">
      <h3 className={cx('fr-m-0')}>
        Récapitulatif du prélèvement {sample.reference}
        {hasPermission('updateSample') && (
          <div className={cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}>
            Vérifiez l’ensemble des informations avant de finaliser votre envoi
          </div>
        )}
      </h3>
      <CreationStepSummary sample={sample} />
      <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
      <MatrixStepSummary sample={sample} />
      <hr className={cx('fr-mx-0', 'fr-hidden', 'fr-unhidden-sm')} />
      <h3 className={cx('fr-m-0')}>Échantillons prélevés</h3>
      <ItemsStepSummary
        sample={sample}
        itemChildren={(item, itemIndex) => (
          <>
            <hr className={cx('fr-m-0')} />
            <div>
              <div className={cx('fr-text--bold', 'fr-text--lg')}>
                Document d'accompagnement du prélèvement / Procès verbal
              </div>
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
            <Accordion label="Informer le détenteur de la marchandise">
              TODO
            </Accordion>
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
                <SendingModal
                  sample={sample}
                  laboratory={laboratory}
                  onConfirm={submit}
                />
              ) : (
                <Alert severity={'error'} title={'Laboratoire non trouvé'} />
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SendingStep;
