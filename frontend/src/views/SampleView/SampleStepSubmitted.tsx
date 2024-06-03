import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { CultureKindLabels } from 'shared/referential/CultureKind';
import { DepartmentLabels } from 'shared/referential/Department';
import { LegalContextLabels } from 'shared/referential/LegalContext';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'shared/referential/MatrixPart';
import { QuantityUnitLabels } from 'shared/referential/QuantityUnit';
import { StageLabels } from 'shared/referential/Stage';
import { StorageConditionLabels } from 'shared/referential/StorageCondition';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useLazyGetDocumentDownloadSignedUrlQuery } from 'src/services/document.service';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import {
  getSampleItemDocumentURL,
  useUpdateSampleMutation,
} from 'src/services/sample.service';

interface Props {
  sample: PartialSample;
}

const SampleStepSubmitted = ({ sample }: Props) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthentication();
  const [updateSample, { isSuccess: isUpdateSuccess }] =
    useUpdateSampleMutation();
  const [getDocumentUrl] = useLazyGetDocumentDownloadSignedUrlQuery();

  const { data: sampleProgrammingPlan } = useGetProgrammingPlanQuery(
    sample.programmingPlanId,
    {
      skip: !sample.programmingPlanId,
    }
  );

  const openFile = async (documentId: string) => {
    const url = await getDocumentUrl(documentId).unwrap();
    window.open(url);
  };

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
          <strong>Date de prélèvement : </strong>
          {format(sample.sampledAt, 'dd/MM/yyyy')}
        </li>
        <li>
          <strong>Géolocalisation : </strong>
          {sample.userLocation.x} - {sample.userLocation.y}
        </li>
        <li>
          <strong>Département : </strong>
          {DepartmentLabels[sample.department]}
        </li>
        {sample.resytalId && (
          <li>
            <strong>Identifiant résytal : </strong>
            {sample.resytalId}
          </li>
        )}
        {sampleProgrammingPlan && (
          <li>
            <strong>Contexte : </strong>
            {ProgrammingPlanKindLabels[sampleProgrammingPlan.kind]}
          </li>
        )}
        <li>
          <strong>Cadre juridique : </strong>
          {LegalContextLabels[sample.legalContext]}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Lieu de prélèvement</h3>
      <ul>
        <li>
          <strong>SIRET :</strong> {sample.company?.siret}
        </li>
        <li>
          <strong>Nom :</strong> {sample.company?.name}
        </li>
        <li>
          <strong>Adresse :</strong> {sample.company?.address}
        </li>
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Informations spécifiques</h3>
      <ul>
        {sample.matrix && (
          <li>
            <strong>Matrice : </strong>
            {MatrixLabels[sample.matrix]}
          </li>
        )}
        {sample.matrixDetails && (
          <li>
            <strong>Detail de la matrice : </strong>
            {sample.matrixDetails}
          </li>
        )}
        {sample.matrixPart && (
          <li>
            <strong>Partie du végétal : </strong>
            {MatrixPartLabels[sample.matrixPart]}
          </li>
        )}
        {sample.cultureKind && (
          <li>
            <strong>Type de culture : </strong>
            {CultureKindLabels[sample.cultureKind]}
          </li>
        )}
        {sample.stage && (
          <li>
            <strong>Stade de prélèvement : </strong>
            {StageLabels[sample.stage]}
          </li>
        )}
        <li>
          <strong>Contrôle libératoire : </strong>
          {t('boolean', { count: Number(sample.releaseControl ?? 0) })}
        </li>
        <li>
          <strong>
            Condition de maintien du prélèvement sous température dirigée : 
          </strong>
          {t('boolean', {
            count: Number(sample.temperatureMaintenance ?? 0),
          })}
        </li>
        <li>
          <strong>Date de péremption : </strong>
          {sample.expiryDate
            ? format(sample.expiryDate, 'dd/MM/yyyy')
            : 'Non renseignée'}
        </li>
        {sample.storageCondition && (
          <li>
            <strong>Condition de stockage : </strong>
            {StorageConditionLabels[sample.storageCondition]}
          </li>
        )}
        {sample.comment && (
          <li>
            <strong>Commentaire : </strong>
            {sample.comment}
          </li>
        )}
      </ul>
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <h3>Échantillons</h3>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {(sample.items ?? []).map((item, itemIndex) => (
          <div key={itemIndex} className={cx('fr-col-6')}>
            <Card
              title={`Échantillon ${itemIndex + 1}`}
              shadow
              size="small"
              end={
                <ul>
                  <li>
                    <strong>Quantité : </strong>
                    {item.quantity}
                    {item.quantityUnit && QuantityUnitLabels[item.quantityUnit]}
                  </li>
                  <li>
                    <strong>Numéro de scellé : </strong>
                    {item.sealId}
                  </li>
                  <li>
                    <strong>Directive 2002/63 respectée : </strong>
                    {item.compliance200263 ? 'Oui' : 'Non'}
                  </li>
                  <li>
                    <strong>Recours au poolage : </strong>
                    {item.pooling ? 'Oui' : 'Non'}
                  </li>
                  {item.pooling && (
                    <li>
                      <strong>Nombre d'unités : </strong>
                      {item.poolingCount}
                    </li>
                  )}
                </ul>
              }
              footer={
                <>
                  {hasPermission('downloadSampleItemDocument') &&
                    ['Sent', 'Submitted'].includes(sample.status) && (
                      <Button
                        priority="secondary"
                        iconId="fr-icon-download-line"
                        onClick={() =>
                          sample.status === 'Submitted'
                            ? window.open(
                                getSampleItemDocumentURL(
                                  sample.id,
                                  itemIndex + 1
                                )
                              )
                            : openFile(item.documentId as string)
                        }
                        disabled={sample.status == 'Sent' && !item.documentId}
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
                    navigate(`/prelevements/${sample.id}?etape=4`, {
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

export default SampleStepSubmitted;
