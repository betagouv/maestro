import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { DepartmentLabels } from 'shared/referential/Department';
import { LegalContextLabels } from 'shared/referential/LegalContext';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  partialSample: PartialSample;
  showLabel?: boolean;
}

const CreationStepSummary = ({ partialSample, showLabel }: Props) => {
  const { data: sampleProgrammingPlan } = useGetProgrammingPlanQuery(
    partialSample.programmingPlanId as string,
    {
      skip: !partialSample.programmingPlanId,
    }
  );

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          Le contexte du prélèvement
        </Badge>
      }
      showLabel={showLabel}
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-user-line')}></div>
        <div>
          Prélèvement réalisé par 
          <b>
            {partialSample.sampler.firstName} {partialSample.sampler.lastName}
          </b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-calendar-event-line')}></div>
        <div>
          Prélèvement réalisé le{' '}
          <b>{format(partialSample.sampledAt, 'dd/MM/yyyy')}</b> à{' '}
          <b>{format(partialSample.sampledAt, "HH'h'mm")}</b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-road-map-line')}></div>
        <div>
          Département : <b>{DepartmentLabels[partialSample.department]}</b>
          {partialSample.geolocation ? (
            <div>
              Latitude : <b>{partialSample.geolocation.x}</b> Longitude :
              <b>{partialSample.geolocation.y}</b>
            </div>
          ) : (
            <div>
              Latitude et longitude :{' '}
              <span className={cx('fr-label--error')}>
                Informations à compléter
              </span>
            </div>
          )}
          {partialSample.parcel && (
            <div>
              N° ou appellation de la parcelle : <b>{partialSample.parcel}</b>
            </div>
          )}
        </div>
      </div>
      {sampleProgrammingPlan && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-microscope-line')}></div>
          <div>
            Contexte :{' '}
            <b>{ProgrammingPlanKindLabels[sampleProgrammingPlan?.kind]}</b>
          </div>
        </div>
      )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-scales-3-line')}></div>
        <div>
          Cadre juridique :{' '}
          <b>{LegalContextLabels[partialSample.legalContext]}</b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-map-pin-2-line')}></div>
        <div>
          Entité contrôlée :{' '}
          {partialSample.company ? (
            <>
              <b>{partialSample.company.name}</b> - SIRET{' '}
              {partialSample.company.siret}
            </>
          ) : (
            <>
              {partialSample.companySearch}
              <div className={cx('fr-label--error')}>
                Information à compléter
              </div>
            </>
          )}
          {partialSample.resytalId && (
            <div>
              Identifiant RESYTAL : <b>{partialSample.resytalId}</b>
            </div>
          )}
        </div>
      </div>
      {partialSample.notesOnCreation && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>“ {partialSample.notesOnCreation} “</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default CreationStepSummary;
