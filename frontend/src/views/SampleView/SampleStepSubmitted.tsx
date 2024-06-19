import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import React from 'react';
import { CultureKindLabels } from 'shared/referential/CultureKind';
import { DepartmentLabels } from 'shared/referential/Department';
import { LegalContextLabels } from 'shared/referential/LegalContext';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'shared/referential/MatrixPart';
import { StageLabels } from 'shared/referential/Stage';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { Sample } from 'shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useLazyGetDocumentDownloadSignedUrlQuery } from 'src/services/document.service';
import { useGetLaboratoryQuery } from 'src/services/laboratory.service';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import PreviousButton from 'src/views/SampleView/PreviousButton';
import SampleItemsCallout from 'src/views/SampleView/SampleItemsCallout';
import SampleSendModal from 'src/views/SampleView/SampleSendModal';

interface Props {
  sample: Sample;
}

const SampleStepSubmitted = ({ sample }: Props) => {
  const { hasPermission } = useAuthentication();
  const [updateSample] = useUpdateSampleMutation();
  const [getDocumentUrl] = useLazyGetDocumentDownloadSignedUrlQuery();

  const { data: sampleProgrammingPlan } = useGetProgrammingPlanQuery(
    sample.programmingPlanId as string,
    {
      skip: !sample.programmingPlanId,
    }
  );

  const { data: laboratory } = useGetLaboratoryQuery(
    sample.laboratoryId as string,
    {
      skip: !sample.laboratoryId,
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
        {hasPermission('updateSample') && sample.status !== 'Sent' && (
          <div className={cx('fr-text--md', 'fr-text--regular', 'fr-m-0')}>
            Vérifiez l’ensemble des informations avant de finaliser votre envoi
          </div>
        )}
      </h3>
      <section className="sample-step-summary">
        <Badge className={cx('fr-badge--green-menthe')}>
          Le contexte du prélèvement
        </Badge>
        <div className="summary-item">
          <div className={cx('fr-icon-user-line')}></div>
          <div>Prélèvement réalisé par TODO</div>
        </div>
        <div className="summary-item">
          <div className={cx('fr-icon-calendar-event-line')}></div>
          <div>
            Prélèvement réalisé le{' '}
            <b>{format(sample.sampledAt, 'dd/MM/yyyy')}</b> à{' '}
            <b>{format(sample.sampledAt, "HH'h'mm")}</b>
          </div>
        </div>
        <div className="summary-item">
          <div className={cx('fr-icon-road-map-line')}></div>
          <div>
            Département : <b>{DepartmentLabels[sample.department]}</b>
            <div>
              Latitude : <b>{sample.geolocation.x}</b> Longitude : 
              <b>{sample.geolocation.y}</b>
            </div>
            {sample.parcel && (
              <div>
                N° ou appellation de la parcelle : <b>{sample.parcel}</b>
              </div>
            )}
          </div>
        </div>
        {sampleProgrammingPlan && (
          <div className="summary-item">
            <div className={cx('fr-icon-microscope-line')}></div>
            <div>
              Contexte :{' '}
              <b>{ProgrammingPlanKindLabels[sampleProgrammingPlan?.kind]}</b>
            </div>
          </div>
        )}
        <div className="summary-item">
          <div className={cx('fr-icon-scales-3-line')}></div>
          <div>
            Cadre juridique : <b>{LegalContextLabels[sample.legalContext]}</b>
          </div>
        </div>
        <div className="summary-item">
          <div className={cx('fr-icon-map-pin-2-line')}></div>
          <div>
            Entité contrôlée : <b>{sample.company.name}</b> - SIRET{' '}
            {sample.company.siret}
            {sample.resytalId && (
              <div>
                Identifiant RESYTAL : <b>{sample.resytalId}</b>
              </div>
            )}
          </div>
        </div>
        {sample.notesOnCreation && (
          <div className="summary-item">
            <div className={cx('fr-icon-quote-line')}></div>
            <div>
              Note additionnelle{' '}
              <div>
                <b>“ {sample.notesOnCreation} “</b>
              </div>
            </div>
          </div>
        )}
      </section>
      <hr className={cx('fr-mx-0')} />
      <section className="sample-step-summary">
        <Badge className={cx('fr-badge--green-tilleul-verveine')}>
          La matrice contrôlée
        </Badge>
        <div className="summary-item">
          <div className={cx('fr-icon-restaurant-line')}></div>
          <div>
            Matrice : <b>{MatrixLabels[sample.matrix]}</b>
            <div>
              LMR/ Partie du végétal concernée :{' '}
              <b>{MatrixPartLabels[sample.matrixPart]}</b>
            </div>
            {sample.matrixDetails && (
              <div>
                Détails de la matrice : <b>{sample.matrixDetails}</b>
              </div>
            )}
          </div>
        </div>
        {sample.cultureKind && (
          <div className="summary-item">
            <div className={cx('fr-icon-seedling-line')}></div>
            <div>
              Type de culture : <b>{CultureKindLabels[sample.cultureKind]}</b>
            </div>
          </div>
        )}
        <div className="summary-item">
          <div className={cx('fr-icon-sip-line')}></div>
          <div>
            Stade de prélèvement : <b>{StageLabels[sample.stage]}</b>
          </div>
        </div>
        {sample.notesOnMatrix && (
          <div className="summary-item">
            <div className={cx('fr-icon-quote-line')}></div>
            <div>
              Note additionnelle{' '}
              <div>
                <b>“ {sample.notesOnMatrix} “</b>
              </div>
            </div>
          </div>
        )}
      </section>
      <hr className={cx('fr-mx-0')} />
      <h3 className={cx('fr-m-0')}>Échantillons prélevés</h3>
      <div className="sample-items">
        <SampleItemsCallout items={sample.items} />
        {sample.notesOnItems && (
          <div className={cx('fr-col-12')}>
            <strong>Commentaires : </strong>
            {sample.notesOnItems}
          </div>
        )}
        {sample.notesOnItems && (
          <div className="summary-item">
            <div className={cx('fr-icon-quote-line')}></div>
            <div>
              Note additionnelle{' '}
              <div>
                <b>“ {sample.notesOnItems} “</b>
              </div>
            </div>
          </div>
        )}
      </div>
      <hr className={cx('fr-mx-0')} />
      {hasPermission('updateSample') && sample.status !== 'Sent' && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
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
                  <SampleSendModal
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
        </div>
      )}
    </div>
  );
};

export default SampleStepSubmitted;
