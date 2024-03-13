import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { PartialSample } from 'shared/schema/Sample';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  sample: PartialSample;
}

const SampleFormStep3 = ({ sample }: Props) => {
  const [updateSample] = useUpdateSampleMutation();

  const modifiy = () => {
    updateSample({
      sampleId: sample.id,
      sampleUpdate: {
        status: 'Draft',
      },
    });
  };

  return (
    <div>
      <p>
        Vérifiez que les informations saisies sont correctes avant de valider
        l'envoi de votre prélèvement.
      </p>
      <ul>
        <li>
          <strong>Numéro de résytal :</strong> {sample.resytalId}
        </li>
        <li>
          <strong>Contexte du prélèvement :</strong> {sample.context}
        </li>
        <li>
          <strong>Département :</strong> {sample.department}
        </li>
        <li>
          <strong>Matrice :</strong> {sample.matrix}
        </li>
        <li>
          <strong>Partie du végétal :</strong> {sample.matrixPart}
        </li>
        <li>
          <strong>Stade du végétal :</strong> {sample.stage}
        </li>
        <li>
          <strong>Quantité :</strong> {sample.quantity} {sample.quantityUnit}
        </li>
        <li>
          <strong>Nombre de prélèvements :</strong> {sample.sampleCount}
        </li>
        <li>
          <strong>Numéro de scellé :</strong> {sample.sealId}
        </li>
      </ul>
      <ButtonsGroup
        inlineLayoutWhen="md and up"
        buttons={[
          {
            children: 'Modifier le prélèvement',
            onClick: modifiy,
            priority: 'secondary',
            type: 'button',
          },
          {
            children: 'Envoyer le prélèvement',
          },
        ]}
      />
    </div>
  );
};

export default SampleFormStep3;
