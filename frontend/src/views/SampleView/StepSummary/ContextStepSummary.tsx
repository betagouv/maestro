import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { format } from 'date-fns';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  isCreatedPartialSample,
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { quote } from 'src/utils/stringUtils';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';
import { usePartialSample } from '../../../hooks/usePartialSample';
import { useAppSelector } from '../../../hooks/useStore';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  showLabel?: boolean;
  onChangeResytalId: (resytalId: string) => void;
}

const ContextStepSummary = ({
  sample,
  showLabel,
  onChangeResytalId
}: Props) => {
  const { user } = useAuthentication();
  const { readonly } = usePartialSample(sample);
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

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
          Prélèvement réalisé par{' '}
          <b>
            {isCreatedPartialSample(sample)
              ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
              : `${user?.firstName} ${user?.lastName}`}
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
      {(programmingPlan?.contexts ?? []).length > 1 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-microscope-line')}></div>
          <div>
            Contexte : <b>{ContextLabels[sample.context]}</b>
          </div>
        </div>
      )}
      {(programmingPlan?.kinds ?? []).length > 1 && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-microscope-line')}></div>
          <div>
            Type de plan :{' '}
            <b>
              {
                ProgrammingPlanKindLabels[
                  sample.specificData.programmingPlanKind
                ]
              }
            </b>
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
              onChange: (e) => onChangeResytalId?.(e.target.value)
            }}
            disabled={readonly}
          />
        </div>
      </div>
      {sample.notesOnCreation && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>{quote(sample.notesOnCreation)}</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default ContextStepSummary;
