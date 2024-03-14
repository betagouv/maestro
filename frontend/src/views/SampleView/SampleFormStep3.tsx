import Button from '@codegouvfr/react-dsfr/Button';
import { PartialSample } from 'shared/schema/Sample/Sample';

interface Props {
  partialSample: PartialSample;
}

const SampleFormStep3 = ({ partialSample }: Props) => {
  return (
    <div>
      <p>
        Vérifiez que les informations saisies sont correctes avant de valider
        l'envoi de votre prélèvement.
      </p>
      <ul>
        <li>
          <strong>Numéro de résytal :</strong> {partialSample.resytalId}
        </li>
        <li>
          <strong>Contexte du prélèvement :</strong>{' '}
          {partialSample.planningContext}
        </li>
        <li>
          <strong>Département :</strong> {partialSample.department}
        </li>
        <li>
          <strong>Matrice :</strong> {partialSample.matrix}
        </li>
        <li>
          <strong>Partie du végétal :</strong> {partialSample.matrixPart}
        </li>
        <li>
          <strong>Stade du végétal :</strong> {partialSample.stage}
        </li>
        <li>
          <strong>Quantité :</strong> {partialSample.quantity}{' '}
          {partialSample.quantityUnit}
        </li>
        <li>
          <strong>Nombre de prélèvements :</strong> {partialSample.sampleCount}
        </li>
        <li>
          <strong>Numéro de scellé :</strong> {partialSample.sealId}
        </li>
      </ul>
      <Button children="Envoyer le prélèvement" />
    </div>
  );
};

export default SampleFormStep3;
