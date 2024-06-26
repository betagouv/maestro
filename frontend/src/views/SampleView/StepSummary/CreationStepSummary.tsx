import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { format } from 'date-fns';
import { DepartmentLabels } from 'shared/referential/Department';
import { LegalContextLabels } from 'shared/referential/LegalContext';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { Sample } from 'shared/schema/Sample/Sample';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: Sample;
}

const CreationStepSummary = ({ sample }: Props) => {
  const { data: sampleProgrammingPlan } = useGetProgrammingPlanQuery(
    sample.programmingPlanId as string,
    {
      skip: !sample.programmingPlanId,
    }
  );

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          Le contexte du prélèvement
        </Badge>
      }
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-user-line')}></div>
        <div>
          Prélèvement réalisé par
          <b>
            {sample.sampler.firstName} {sample.sampler.lastName}
          </b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-calendar-event-line')}></div>
        <div>
          Prélèvement réalisé le <b>{format(sample.sampledAt, 'dd/MM/yyyy')}</b>{' '}
          à <b>{format(sample.sampledAt, "HH'h'mm")}</b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-road-map-line')}></div>
        <div>
          Département : <b>{DepartmentLabels[sample.department]}</b>
          <div>
            Latitude : <b>{sample.geolocation.x}</b> Longitude :
            <b>{sample.geolocation.y}</b>
          </div>
          {sample.parcel && (
            <div>
              N° ou appellation de la parcelle : <b>{sample.parcel}</b>
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
          Cadre juridique : <b>{LegalContextLabels[sample.legalContext]}</b>
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-map-pin-2-line')}></div>
        <div>
          Entité contrôlée : <b>{sample.company.name}</b> - SIRET{' '}
          {sample.company.siret}
          {sample.resytalId && (
            <div>
              Identifiant RESYTAL : <b>{sample.resytalId}</b>
            </div>
          )}
        </div>
      </div>
      {sample.notesOnCreation && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>“ {sample.notesOnCreation} “</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default CreationStepSummary;
