import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentLabels } from 'shared/schema/Department';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  getsampleDocumentURL,
  useUpdateSampleMutation,
} from 'src/services/sample.service';

interface Props {
  sample: PartialSample;
}

const SampleStep4 = ({ sample }: Props) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthentication();
  const [updateSample, { isSuccess: isUpdateSuccess }] =
    useUpdateSampleMutation();

  const { data: programmingPlans } = useFindProgrammingPlansQuery({
    status: 'Validated',
  });

  const sampleProgrammingPlan = useMemo(
    () =>
      programmingPlans?.find((plan) => plan.id === sample.programmingPlanId),
    [programmingPlans, sample.programmingPlanId]
  );

  const submit = async () => {
    await updateSample({
      ...sample,
      status: 'Sent',
      sentAt: new Date(),
    });
  };

  return (
    <div data-testid="sample_data">
      {hasPermission('updateSample') && sample.status !== 'Sent' && (
        <p>
          Vérifiez que les informations saisies sont correctes avant de valider
          l'envoi de votre prélèvement.
        </p>
      )}
      <h3>Informations générales</h3>
      <ul>
        <li>
          <strong>Date de prélèvement :</strong>
          {format(sample.sampledAt, 'dd/MM/yyyy')}
        </li>
        <li>
          <strong>Géolocalisation :</strong> {sample.userLocation.x} -{' '}
          {sample.userLocation.y}
        </li>
        <li>
          <strong>Département :</strong> {DepartmentLabels[sample.department]}
        </li>
        <li>
          <strong>Identifiant résytal :</strong> {sample.resytalId}
        </li>
        {sampleProgrammingPlan && (
          <li>
            <strong>Contexte :</strong>{' '}
            {ProgrammingPlanKindLabels[sampleProgrammingPlan.kind]}
          </li>
        )}
        <li>
          <strong>Cadre juridique :</strong> {sample.legalContext}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Informations spécifiques</h3>
      <ul>
        <li>
          <strong>Matrice :</strong> {sample.matrix}
        </li>
        <li>
          <strong>Catégorie de matrice :</strong> {sample.matrixKind}
        </li>
        <li>
          <strong>Partie du végétal :</strong> {sample.matrixPart}
        </li>
        <li>
          <strong>Type de culture :</strong> {sample.cultureKind}
        </li>
        <li>
          <strong>Stade de prélèvement :</strong> {sample.stage}
        </li>
        <li>
          <strong>Contrôle libératoire :</strong>{' '}
          {t('boolean', { count: Number(sample.releaseControl ?? 0) })}
        </li>
        <li>
          <strong>
            Condition de maintien du prélèvement sous température dirigée :
          </strong>{' '}
          {t('boolean', {
            count: Number(sample.temperatureMaintenance ?? 0),
          })}
        </li>
        <li>
          <strong>Date de péremption :</strong>{' '}
          {sample.expiryDate
            ? format(sample.expiryDate, 'dd/MM/yyyy')
            : 'Non renseignée'}
        </li>
        <li>
          <strong>Condition de stockage :</strong> {sample.storageCondition}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Échantillons</h3>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {(sample.items ?? []).map((item, index) => (
          <div key={index} className={cx('fr-col-6')}>
            <Card
              title={`Échantillon ${index + 1}`}
              shadow
              size="small"
              end={
                <ul>
                  <li>
                    <strong>Quantité :</strong> {item.quantity} 
                    {item.quantityUnit}
                  </li>
                  <li>
                    <strong>Numéro de scellé :</strong> {item.sealId}
                  </li>
                  <li>
                    <strong>Respect directive 2002/63 :</strong> 
                    {item.compliance200263 ? 'Oui' : 'Non'}
                  </li>
                  <li>
                    <strong>Recours au poolage :</strong> 
                    {item.pooling ? 'Oui' : 'Non'}
                  </li>
                  {item.pooling && (
                    <li>
                      <strong>Nombre d'unités :</strong> {item.poolingCount}
                    </li>
                  )}
                </ul>
              }
              footer={
                <>
                  {hasPermission('downloadSampleDocument') &&
                    sample.status === 'Submitted' && (
                      <Button
                        priority="secondary"
                        iconId="fr-icon-download-line"
                        onClick={() =>
                          window.open(getsampleDocumentURL(sample.id))
                        }
                      >
                        Document d'accompagnement
                      </Button>
                    )}
                </>
              }
            />
          </div>
        ))}
      </div>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Lieu de prélèvement</h3>
      <ul>
        <li>
          <strong>SIRET du site :</strong> {sample.locationSiret}
        </li>
        <li>
          <strong>Nom du site :</strong> {sample.locationName}
        </li>
        <li>
          <strong>Adresse du site :</strong> {sample.locationAddress}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <ul>
        <li>
          <strong>Commentaire :</strong> {sample.comment}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      {isUpdateSuccess ? (
        <Alert severity="success" title="Le prélèvement a bien été envoyé." />
      ) : (
        <>
          {hasPermission('updateSample') && sample.status !== 'Sent' && (
            <ButtonsGroup
              inlineLayoutWhen="md and up"
              buttons={[
                {
                  children: 'Etape précédente',
                  priority: 'secondary',
                  onClick: async (e) => {
                    e.preventDefault();
                    await updateSample({
                      ...sample,
                      status: 'DraftItems',
                    });
                    navigate(`/prelevements/${sample.id}?etape=3`, {
                      replace: true,
                    });
                  },
                  nativeButtonProps: {
                    'data-testid': 'previous-button',
                  },
                },
                {
                  children: 'Envoyer le prélèvement',
                  onClick: submit,
                  nativeButtonProps: {
                    'data-testid': 'submit-button',
                  },
                },
              ]}
            />
          )}
          {sample.status === 'Sent' && (
            <Alert
              severity="info"
              title={`Le prélevement a été envoyé ${
                sample.sentAt ? 'le' + format(sample.sentAt, 'dd/MM/yyyy') : ''
              }`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SampleStep4;
