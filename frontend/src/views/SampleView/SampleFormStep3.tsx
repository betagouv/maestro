import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { t } from 'i18next';
import { DepartmentLabels } from 'shared/schema/Department';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample;
}

const SampleFormStep3 = ({ partialSample }: Props) => {
  const [updateSample, { isSuccess: isUpdateSuccess }] =
    useUpdateSampleMutation();

  const submit = async () => {
    await updateSample({
      ...partialSample,
      status: 'Sent',
      sentAt: new Date(),
    });
  };

  return (
    <div>
      {partialSample.status !== 'Sent' && (
        <p>
          Vérifiez que les informations saisies sont correctes avant de valider
          l'envoi de votre prélèvement.
        </p>
      )}
      <ul>
        <li>
          <strong>Date de prélèvement :</strong>
          {format(partialSample.sampledAt, 'dd/MM/yyyy')}
        </li>
        <li>
          <strong>Géolocalisation :</strong> {partialSample.userLocation.x} -{' '}
          {partialSample.userLocation.y}
        </li>
        <li>
          <strong>Département :</strong>{' '}
          {DepartmentLabels[partialSample.department]}
        </li>
        <li>
          <strong>Identifiant résytal :</strong> {partialSample.resytalId}
        </li>
        <li>
          <strong>Contexte :</strong> {partialSample.planningContext}
        </li>
        <li>
          <strong>Cadre juridique :</strong> {partialSample.legalContext}
        </li>
        <li>
          <strong> Catégorie de matrice :</strong> {partialSample.matrixKind}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <ul>
        <li>
          <strong>Matrice :</strong> {partialSample.matrix}
        </li>
        <li>
          <strong>Partie du végétal :</strong> {partialSample.matrixPart}
        </li>
        <li>
          <strong>Type de culture :</strong> {partialSample.cultureKind}
        </li>
        <li>
          <strong>Stade de prélèvement :</strong> {partialSample.stage}
        </li>
        <li>
          <strong>Quantité :</strong> {partialSample.quantity}{' '}
          {partialSample.quantityUnit}
        </li>
        <li>
          <strong>Nombre d'écchantillons :</strong> {partialSample.sampleCount}
        </li>
        <li>
          <strong>Conformité 2002/63 :</strong>{' '}
          {t('boolean', { count: Number(partialSample.compliance200263 ?? 0) })}
        </li>
        <li>
          <strong>Recours au poolage :</strong>{' '}
          {t('boolean', { count: Number(partialSample.pooling ?? 0) })}
        </li>
        <li>
          <strong>Contrôle libératoire :</strong>{' '}
          {t('boolean', { count: Number(partialSample.releaseControl ?? 0) })}
        </li>
        <li>
          <strong>Maintenance de la température :</strong>{' '}
          {t('boolean', {
            count: Number(partialSample.temperatureMaintenance ?? 0),
          })}
        </li>
        <li>
          <strong>Date de péremption :</strong>{' '}
          {partialSample.expiryDate
            ? format(partialSample.expiryDate, 'dd/MM/yyyy')
            : 'Non renseignée'}
        </li>
        <li>
          <strong>Condition de stockage :</strong>{' '}
          {partialSample.storageCondition}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <ul>
        <li>
          <strong>SIRET du site :</strong> {partialSample.locationSiret}
        </li>
        <li>
          <strong>Nom du site :</strong> {partialSample.locationName}
        </li>
        <li>
          <strong>Adresse du site :</strong> {partialSample.locationAddress}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <ul>
        <li>
          <strong>Commentaire :</strong> {partialSample.comment}
        </li>
      </ul>
      {isUpdateSuccess && (
        <Alert severity="success" title="Le prélèvement a bien été envoyé." />
      )}
      {partialSample.status !== 'Sent' ? (
        <Button children="Envoyer le prélèvement" onClick={submit} />
      ) : (
        <Alert
          severity="info"
          title={`Le prélevement a été envoyé ${
            partialSample.sentAt
              ? 'le' + format(partialSample.sentAt, 'dd/MM/yyyy')
              : ''
          }`}
        />
      )}
    </div>
  );
};

export default SampleFormStep3;
