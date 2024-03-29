import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { t } from 'i18next';
import { DepartmentLabels } from 'shared/schema/Department';
import { Sample } from 'shared/schema/Sample/Sample';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  sample: Sample;
}

const SampleStep3 = ({ sample }: Props) => {
  const [updateSample, { isSuccess: isUpdateSuccess }] =
    useUpdateSampleMutation();

  const submit = async () => {
    await updateSample({
      ...sample,
      status: 'Sent',
      sentAt: new Date(),
    });
  };

  return (
    <div>
      {sample.status !== 'Sent' && (
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
        <li>
          <strong>Contexte :</strong> {sample.planningContext}
        </li>
        <li>
          <strong>Cadre juridique :</strong> {sample.legalContext}
        </li>
        <li>
          <strong> Catégorie de matrice :</strong> {sample.matrixKind}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Informations spécifiques</h3>
      <ul>
        <li>
          <strong>Matrice :</strong> {sample.matrix}
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
          <strong>Maintenance de la température :</strong>{' '}
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
      <ul>
        {sample.items.map((item, index) => (
          <li key={index}>
            <strong>Échantillon {index + 1}</strong>
            <ul>
              <li>
                <strong>Quantité :</strong> {item.quantity} {item.quantityUnit}
              </li>
              <li>
                <strong>Identifiant du scellé :</strong> {item.sealId}
              </li>
            </ul>
          </li>
        ))}
      </ul>
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
          {sample.status !== 'Sent' ? (
            <Button children="Envoyer le prélèvement" onClick={submit} />
          ) : (
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

export default SampleStep3;
