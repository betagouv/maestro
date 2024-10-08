import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { format } from 'date-fns';
import { DepartmentLabels } from 'shared/referential/Department';
import { LegalContextLabels } from 'shared/referential/LegalContext';
import { ProgrammingPlanKindLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  isCreatedSample,
  Sample,
  SampleToCreate,
} from 'shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useGetProgrammingPlanQuery } from 'src/services/programming-plan.service';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: Sample | SampleToCreate;
  showLabel?: boolean;
  onChangeResytalId: (resytalId: string) => void;
}

const ContextStepSummary = ({
  sample,
  showLabel,
  onChangeResytalId,
}: Props) => {
  const { userInfos } = useAuthentication();

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
      showLabel={showLabel}
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-user-line')}></div>
        <div>
          Prélèvement réalisé par 
          <b>
            {isCreatedSample(sample)
              ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
              : `${userInfos?.firstName} ${userInfos?.lastName}`}
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
          {sample.geolocation ? (
            <div>
              Latitude : <b>{sample.geolocation.x}</b> Longitude :
              <b>{sample.geolocation.y}</b>
            </div>
          ) : (
            <div>
              Latitude et longitude :{' '}
              <span className="missing-data">Informations à compléter</span>
            </div>
          )}
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
          Entité contrôlée :{' '}
          {sample.company ? (
            <>
              <b>{sample.company.name}</b> - SIRET {sample.company.siret}
            </>
          ) : (
            <>
              {sample.companyOffline}
              <div className="missing-data">Information à compléter</div>
            </>
          )}
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-map-pin-user-line')}></div>
        <div>
          <Input
            label="Identifiant Resytal"
            hintText="Format AA-XXXXXX"
            nativeInputProps={{
              defaultValue: sample.resytalId || '',
              onChange: (e) => onChangeResytalId?.(e.target.value),
            }}
          />
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

export default ContextStepSummary;
