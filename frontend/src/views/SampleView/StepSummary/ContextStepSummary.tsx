import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  isCreatedPartialSample,
  SampleChecked,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { quote } from 'src/utils/stringUtils';
import StepSummary, {
  StepSummaryMode
} from 'src/views/SampleView/StepSummary/StepSummary';
import { SampleMap } from '../../../components/Sample/SampleMap/SampleMap';
import { usePartialSample } from '../../../hooks/usePartialSample';
import { useAppSelector } from '../../../hooks/useStore';

interface Props {
  sample: (SampleChecked | SampleToCreate) & Partial<SampleOwnerData>;
  mode?: StepSummaryMode;
  onChangeResytalId: (resytalId: string) => void;
  onEdit?: () => void;
}

const ContextStepSummary = ({
  sample,
  mode = 'section',
  onChangeResytalId,
  onEdit
}: Props) => {
  const { user } = useAuthentication();
  const { readonly } = usePartialSample(sample);
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  return (
    <StepSummary title="Contexte du prélèvement" onEdit={onEdit} mode={mode}>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-user-line')}></div>
        <div>
          Prélèvement réalisé par{' '}
          <b>
            {isCreatedPartialSample(sample)
              ? `${sample.sampler.name}`
              : `${user?.name}`}
          </b>
          {isCreatedPartialSample(sample) && sample.additionalSampler && (
            <>
              {' et '}
              <b>{sample.additionalSampler.name}</b>
            </>
          )}
        </div>
      </div>
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-road-map-line')}></div>
        <div>
          {sample.department ? (
            <>
              Département : <b>{DepartmentLabels[sample.department]}</b>
            </>
          ) : (
            <div>
              Département :{' '}
              <span className="missing-data">Informations à compléter</span>
            </div>
          )}
          {sample.geolocation ? (
            <div>
              <div>
                Latitude : <b>{sample.geolocation.x}</b> Longitude :
                <b>{sample.geolocation.y}</b>
              </div>
              <SampleMap
                markerX={sample.geolocation.x}
                markerY={sample.geolocation.y}
              />
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
      {programmingPlan?.legalContexts &&
        programmingPlan.legalContexts.length > 1 && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-scales-3-line')}></div>
            <div>
              Cadre juridique : <b>{LegalContextLabels[sample.legalContext]}</b>
            </div>
          </div>
        )}
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
      {sample.specificData.programmingPlanKind === 'PPV' && (
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
      )}
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
